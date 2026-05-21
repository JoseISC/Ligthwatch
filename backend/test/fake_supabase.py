"""Cliente Supabase en memoria para tests de integración cuando la instancia local no está disponible.

Implementa el patrón encadenado que usa main.py:
    supabase.table("T").select("*").eq("col", val).limit(n).execute()
    supabase.table("T").insert(payload).execute()
    supabase.table("T").update(payload).eq("col", val).execute()

Cumple las mismas restricciones que la BD real:
    - Unique constraint en TipoEventos.tipo_evento (lanza APIError en duplicados)
    - Auto-increment en eventos.id
    - Filtros .eq() encadenables
"""

from __future__ import annotations

import threading
from dataclasses import dataclass, field
from typing import Any

from postgrest.exceptions import APIError


@dataclass
class FakeResponse:
    data: list[dict]


_SEED_TIPO_EVENTOS: list[dict] = [
    {
        "tipo_evento": "robo",
        "descripcion_evento": "Robo callejero",
        "activo": True,
        "evento_negativo": True,
        "puntuacion": 5.0,
        "radius": 50.0,
        "duracion": None,
        "created_at": None,
    },
    {
        "tipo_evento": "asalto",
        "descripcion_evento": "Asalto a mano armada",
        "activo": True,
        "evento_negativo": True,
        "puntuacion": 5.0,
        "radius": 50.0,
        "duracion": None,
        "created_at": None,
    },
    {
        "tipo_evento": "accidente",
        "descripcion_evento": "Accidente de tránsito",
        "activo": True,
        "evento_negativo": True,
        "puntuacion": 3.0,
        "radius": 30.0,
        "duracion": None,
        "created_at": None,
    },
    {
        "tipo_evento": "incendio",
        "descripcion_evento": "Incendio",
        "activo": True,
        "evento_negativo": True,
        "puntuacion": 4.0,
        "radius": 40.0,
        "duracion": None,
        "created_at": None,
    },
    {
        "tipo_evento": "manifestacion",
        "descripcion_evento": "Manifestación",
        "activo": True,
        "evento_negativo": False,
        "puntuacion": 2.0,
        "radius": 20.0,
        "duracion": None,
        "created_at": None,
    },
]


class FakeQueryBuilder:
    def __init__(self, store: dict[str, list[dict]], table_name: str) -> None:
        self._store = store
        self._table_name = table_name
        self._operation = "select"
        self._insert_payload: dict | None = None
        self._update_payload: dict | None = None
        self._filters: list[tuple[str, str, Any]] = []
        self._limit_val: int | None = None
        self._select_cols = "*"

    def select(self, cols: str = "*") -> "FakeQueryBuilder":
        self._operation = "select"
        self._select_cols = cols
        return self

    def insert(self, payload: dict) -> "FakeQueryBuilder":
        self._operation = "insert"
        self._insert_payload = dict(payload)
        return self

    def update(self, payload: dict) -> "FakeQueryBuilder":
        self._operation = "update"
        self._update_payload = dict(payload)
        return self

    def eq(self, col: str, val: Any) -> "FakeQueryBuilder":
        self._filters.append(("eq", col, val))
        return self

    def limit(self, n: int) -> "FakeQueryBuilder":
        self._limit_val = n
        return self

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _apply_filters(self, rows: list[dict]) -> list[dict]:
        result = list(rows)
        for op, col, val in self._filters:
            if op == "eq":
                result = [r for r in result if r.get(col) == val]
        return result

    def _project(self, rows: list[dict]) -> list[dict]:
        if self._select_cols == "*":
            return [dict(r) for r in rows]
        cols = [c.strip() for c in self._select_cols.split(",")]
        return [{c: r.get(c) for c in cols} for r in rows]

    # ------------------------------------------------------------------
    # Execute
    # ------------------------------------------------------------------

    def execute(self) -> FakeResponse:
        table = self._store.setdefault(self._table_name, [])

        if self._operation == "select":
            filtered = self._apply_filters(table)
            if self._limit_val is not None:
                filtered = filtered[: self._limit_val]
            return FakeResponse(self._project(filtered))

        if self._operation == "insert":
            payload = dict(self._insert_payload or {})

            if self._table_name == "TipoEventos" and "tipo_evento" in payload:
                duplicate = any(
                    r.get("tipo_evento") == payload["tipo_evento"] for r in table
                )
                if duplicate:
                    raise APIError(
                        {
                            "code": "23505",
                            "message": "duplicate key value violates unique constraint",
                            "details": None,
                            "hint": None,
                        }
                    )
                payload.setdefault("activo", True)
                payload.setdefault("descripcion_evento", "")
                payload.setdefault("evento_negativo", None)
                payload.setdefault("puntuacion", None)
                payload.setdefault("radius", None)
                payload.setdefault("duracion", None)
                payload.setdefault("created_at", None)

            if self._table_name == "eventos":
                existing_ids = [r.get("id", 0) for r in table]
                payload.setdefault("id", max(existing_ids, default=0) + 1)
                payload.setdefault("activo", True)
                payload.setdefault("created_at", None)
                payload.setdefault("descripcion", None)
                payload.setdefault("descripcion_evento", None)
                payload.setdefault("evento_negativo", None)
                payload.setdefault("puntuacion", None)
                payload.setdefault("radius", None)

            table.append(payload)
            return FakeResponse([dict(payload)])

        if self._operation == "update":
            rows_to_update = self._apply_filters(table)
            for row in rows_to_update:
                row.update(self._update_payload or {})
            return FakeResponse([dict(r) for r in rows_to_update])

        return FakeResponse([])


class FakeSupabaseClient:
    """Cliente Supabase en memoria con datos pre-sembrados para tests de integración."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._store: dict[str, list[dict]] = {
            "TipoEventos": [dict(r) for r in _SEED_TIPO_EVENTOS],
            "eventos": [],
        }

    def table(self, name: str) -> FakeQueryBuilder:
        return FakeQueryBuilder(self._store, name)
