from typing import Annotated, Optional

import httpx
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from postgrest.exceptions import APIError
from pydantic import BaseModel, Field
from supabase import Client

from supabase_client import get_supabase

app = FastAPI(
    title="Safe Route API",
    description="""
## Safe Route API

Esta API actua como proxy al motor de rutas Valhalla, diseñado para funcionar en conjunto con MapLibre.

### Como funciona
1. EL usuario clickea dos puntos en el mapa
2. El frontend envia esas coordenadas a `/route`
3. La API envia la request a Valhalla y devuelve la polilinea correspondiente
4. El frontend dibuja la ruta entregada

### Costing models
- `pedestrian` — on-foot routing (default, used by the frontend)
- `bicycle` — cycling routes
- `auto` — driving routes
""",
    version="1.0.0",
    contact={
        "name": "Lightwatch",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

VALHALLA_URL = "http://valhalla:8002"


def _supabase_dep() -> Client:
    try:
        return get_supabase()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e


SupabaseClient = Annotated[Client, Depends(_supabase_dep)]


# --- Models ---

class Coordinate(BaseModel):
    lon: float = Field(..., example=-70.6483, description="Longitud (Eje X)")
    lat: float = Field(..., example=-33.4569, description="Latitud (Eje Y)")

class PedestrianOptions(BaseModel):
    shortest: Optional[bool] = Field(False, description="If true, prefers shortest path over fastest")

class CostingOptions(BaseModel):
    pedestrian: Optional[PedestrianOptions] = None

class RouteRequest(BaseModel):
    locations: list[Coordinate] = Field(
        ...,
        min_length=2,
        max_length=2,
        description="Exactly two coordinates: origin and destination",
        example=[
            {"lon": -70.6483, "lat": -33.4569},
            {"lon": -70.6350, "lat": -33.4420}
        ]
    )
    costing: str = Field(
        "pedestrian",
        description="Routing mode. The frontend uses `pedestrian` by default.",
        example="pedestrian"
    )
    costing_options: Optional[CostingOptions] = Field(
        None,
        description="Fine-tuning options per costing model",
        example={"pedestrian": {"shortest": True}}
    )
    exclude_polygons: Optional[list[list[list[float]]]] = Field(
        None,
        description="Polygons to exclude from routing (Valhalla exclude_polygons parameter)",
        example=[[[-70.65, -33.46], [-70.64, -33.46], [-70.64, -33.45], [-70.65, -33.45], [-70.65, -33.46]]]
    )

class HealthResponse(BaseModel):
    status: str
    valhalla: str

class Routeleg(BaseModel):
    shape: str = Field(..., description="Encoded polyline (precision 6) of the route leg")
    summary: dict

class Trip(BaseModel):
    legs: list[Routeleg]
    summary: dict
    status_message: str

class RouteResponse(BaseModel):
    trip: Trip


class TipoEvento(BaseModel):
    tipo_evento: str
    created_at: Optional[str] = None
    descripcion_evento: str
    activo: bool
    duracion: Optional[float] = None
    puntuacion: Optional[float] = None
    radius: Optional[float] = None
    evento_negativo: Optional[bool] = None


class TipoEventoCreate(BaseModel):
    tipo_evento: str = Field(..., min_length=1, description="Clave primaria del tipo (unica)")
    descripcion_evento: str = Field(..., min_length=1)
    activo: bool = True
    duracion: Optional[float] = Field(None, description="Duracion asociada (columna `duracion` en la BD)")
    puntuacion: Optional[float] = None
    radius: Optional[float] = None
    evento_negativo: Optional[bool] = None


class Evento(BaseModel):
    id: int
    created_at: Optional[str] = None
    tipo_evento: str
    descripcion: Optional[str] = None
    descripcion_evento: Optional[str] = None
    activo: bool
    latitud: float
    longitud: float
    evento_negativo: Optional[bool] = None
    puntuacion: Optional[float] = None
    radius: Optional[float] = None


class EventoCreate(BaseModel):
    tipo_evento: str = Field(
        ...,
        min_length=1,
        description="Debe existir en `TipoEventos` y estar activo; obtener opciones con GET /tipo-eventos",
    )
    latitud: float
    longitud: float
    activo: bool = True


# --- Endpoints ---

@app.get(
    "/health",
    summary="Health check",
    tags=["Status"],
    response_model=HealthResponse
)
async def health():
    """
    Checks whether this API and the Valhalla backend are reachable.
    Useful to confirm the routing engine is up before letting users interact with the map.
    """
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{VALHALLA_URL}/status", timeout=3)
            valhalla_status = "ok" if res.status_code == 200 else "degraded"
    except Exception:
        valhalla_status = "unreachable"

    return {"status": "ok", "valhalla": valhalla_status}


@app.post(
    "/route",
    summary="Obtener ruta entre dos puntos",
    tags=["Routing"],
    response_model=RouteResponse
)
async def route_proxy(body: RouteRequest):
    """
    Procesa una ruta entre dos puntos usando el motor de rutas Valhalla.

    La respuesta contiene un campo `trip.legs[0].shape` — una polilínea 
    codificada (precisión 6) que el frontend decodifica usando `@mapbox/polyline` y renderiza en el mapa de MapLibre.

    ### Ejemplo
```js
    const body = {
      locations: [
        { lon: -70.6483, lat: -33.4569 },
        { lon: -70.6350, lat: -33.4420 }
      ],
      costing: "pedestrian",
      costing_options: { pedestrian: { shortest: true } }
    };
    const res = await fetch("http://localhost:8000/route", { method: "POST", body: JSON.stringify(body) });
    const data = await res.json();
    const shape = data.trip.legs[0].shape; // encoded polyline
```
    """
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                f"{VALHALLA_URL}/route",
                json=body.model_dump(exclude_none=True),
                timeout=10
            )
            res.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Valhalla unreachable: {str(e)}")

        return res.json()


@app.get(
    "/tipo-eventos",
    summary="Listar tipos de evento",
    tags=["Eventos"],
    response_model=list[TipoEvento],
)
async def list_tipo_eventos(
    supabase: SupabaseClient,
    solo_activos: bool = True,
):
    """
    Devuelve los registros de `TipoEventos` para que el cliente elija un `tipo_evento`
    al crear un evento (por ejemplo, desplegable en el formulario).
    """
    q = supabase.table("TipoEventos").select("*")
    if solo_activos:
        q = q.eq("activo", True)
    res = q.execute()
    return res.data or []


@app.post(
    "/tipo-eventos",
    summary="Crear tipo de evento",
    tags=["Eventos"],
    response_model=TipoEvento,
    status_code=201,
)
async def create_tipo_evento(supabase: SupabaseClient, body: TipoEventoCreate):
    payload = body.model_dump(exclude_none=True)
    try:
        res = supabase.table("TipoEventos").insert(payload).execute()
    except APIError as e:
        if getattr(e, "code", None) == "23505":
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe un tipo de evento con el nombre '{body.tipo_evento}'.",
            ) from e
        raise HTTPException(status_code=500, detail=str(e)) from e
    if not res.data:
        raise HTTPException(status_code=500, detail="La inserción no devolvió datos")
    return res.data[0]


@app.get(
    "/eventos",
    summary="Listar eventos",
    tags=["Eventos"],
    response_model=list[Evento],
)
async def list_eventos(supabase: SupabaseClient):
    res = supabase.table("eventos").select("*").eq("activo", True).execute()
    eventos = res.data or []
    
    tipos_res = supabase.table("TipoEventos").select("tipo_evento, descripcion_evento, evento_negativo, puntuacion, radius").execute()
    tipos_map = {t["tipo_evento"]: t for t in tipos_res.data or []}
    
    for row in eventos:
        tipo = row.get("tipo_evento")
        if tipo in tipos_map:
            row["descripcion_evento"] = tipos_map[tipo].get("descripcion_evento")
            row["evento_negativo"] = tipos_map[tipo].get("evento_negativo")
            row["puntuacion"] = tipos_map[tipo].get("puntuacion")
            row["radius"] = tipos_map[tipo].get("radius")
        
    return eventos


@app.post(
    "/eventos",
    summary="Crear evento",
    tags=["Eventos"],
    response_model=Evento,
    status_code=201,
)
async def create_evento(supabase: SupabaseClient, body: EventoCreate):
    check = (
        supabase.table("TipoEventos")
        .select("tipo_evento")
        .eq("tipo_evento", body.tipo_evento)
        .eq("activo", True)
        .limit(1)
        .execute()
    )
    if not check.data:
        raise HTTPException(
            status_code=400,
            detail=(
                "El tipo de evento no existe o esta inactivo. "
                "Use GET /tipo-eventos para ver los valores permitidos."
            ),
        )
    payload = body.model_dump()
    res = supabase.table("eventos").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="La inserción no devolvió datos")
    tipo_res = supabase.table("TipoEventos").select("descripcion_evento, evento_negativo, puntuacion, radius").eq("tipo_evento", body.tipo_evento).limit(1).execute()
    tipo_data = tipo_res.data[0] if tipo_res.data else {}
    
    result = res.data[0]
    result["descripcion_evento"] = tipo_data.get("descripcion_evento")
    result["evento_negativo"] = tipo_data.get("evento_negativo")
    result["puntuacion"] = tipo_data.get("puntuacion")
    result["radius"] = tipo_data.get("radius")
    return result


@app.delete(
    "/eventos/{evento_id}",
    summary="Eliminar evento (soft delete: marca activo=false)",
    tags=["Eventos"],
    status_code=204,
)
async def delete_evento(supabase: SupabaseClient, evento_id: int):
    """
    Marca el evento como inactivo (`activo=false`). Como `GET /eventos` filtra por
    `activo=true`, el evento ya no aparece en el mapa pero se conserva en la BD
    para auditoría.
    """
    existing = (
        supabase.table("eventos")
        .select("id")
        .eq("id", evento_id)
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail=f"Evento {evento_id} no encontrado")

    supabase.table("eventos").update({"activo": False}).eq("id", evento_id).execute()
    return None
