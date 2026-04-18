from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import httpx

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