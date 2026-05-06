"""
Integration tests for Supabase database operations.

These tests use a real Supabase local instance and actual database queries,
as opposed to unit tests which use MagicMock.
"""

import time
import pytest

@pytest.mark.integration
def test_list_tipo_eventos_integration(integration_client):
    """GET /tipo-eventos returns seeded event types."""
    res = integration_client.get("/tipo-eventos")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    tipos = [t["tipo_evento"] for t in data]
    assert "robo" in tipos
    assert "asalto" in tipos


@pytest.mark.integration
def test_create_tipo_evento_integration(integration_client):
    """POST /tipo-eventos creates a new event type."""
    import uuid
    unique_tipo = f"test_tipo_integration_{uuid.uuid4().hex[:8]}"
    payload = {
        "tipo_evento": unique_tipo,
        "descripcion_evento": "Test tipo for integration",
        "activo": True,
        "puntuacion": 3.0,
        "radius": 25.0,
    }
    res = integration_client.post("/tipo-eventos", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["tipo_evento"] == unique_tipo


@pytest.mark.integration
def test_duplicate_tipo_evento_integration(integration_client):
    """Creating a duplicate tipo_evento returns HTTP 400 (unique constraint)."""
    import uuid

    unique_name = f"duplicate_test_{uuid.uuid4().hex[:8]}"
    first = integration_client.post("/tipo-eventos", json={
        "tipo_evento": unique_name,
        "descripcion_evento": "First one",
    })
    assert first.status_code == 201

    res = integration_client.post("/tipo-eventos", json={
        "tipo_evento": unique_name,
        "descripcion_evento": "Duplicate",
    })
    assert res.status_code == 400
    assert unique_name in res.json()["detail"]


@pytest.mark.integration
def test_create_evento_integration(integration_client):
    """POST /eventos creates a new event with type enrichment."""
    payload = {
        "tipo_evento": "robo",
        "latitud": -33.45,
        "longitud": -70.66,
    }
    res = integration_client.post("/eventos", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["tipo_evento"] == "robo"
    assert data["descripcion_evento"] == "Robo callejero"
    assert data["evento_negativo"] is True
    assert data["puntuacion"] == 5.0
    assert data["radius"] == 50.0
    assert data["id"] is not None


@pytest.mark.integration
def test_list_eventos_integration(integration_client):
    """GET /eventos returns events enriched with tipo data."""
    payload = {
        "tipo_evento": "accidente",
        "latitud": -33.5,
        "longitud": -70.7,
    }
    integration_client.post("/eventos", json=payload)

    res = integration_client.get("/eventos")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1

    evento = data[0]
    assert evento["tipo_evento"] is not None
    assert evento.get("descripcion_evento") is not None


@pytest.mark.integration
def test_soft_delete_evento_integration(integration_client):
    """DELETE /eventos/{id} performs soft delete (sets activo=false)."""
    create_payload = {
        "tipo_evento": "asalto",
        "latitud": -33.44,
        "longitud": -70.65,
    }
    create_res = integration_client.post("/eventos", json=create_payload)
    assert create_res.status_code == 201
    evento_id = create_res.json()["id"]

    delete_res = integration_client.delete(f"/eventos/{evento_id}")
    assert delete_res.status_code == 204

    eventos = integration_client.get("/eventos").json()
    assert not any(e["id"] == evento_id for e in eventos)


@pytest.mark.integration
def test_foreign_key_rejection_integration(integration_client):
    """Creating evento with invalid tipo_evento is rejected (FK constraint)."""
    payload = {
        "tipo_evento": "nonexistent_tipo_xyz",
        "latitud": -33.45,
        "longitud": -70.66,
    }
    res = integration_client.post("/eventos", json=payload)
    assert res.status_code == 400
    assert "tipo de evento" in res.json()["detail"].lower()


@pytest.mark.integration
def test_inactive_tipo_evento_rejection_integration(integration_client):
    """Creating evento with inactive tipo_evento is rejected."""
    import uuid
    unique_tipo = f"inactive_test_{uuid.uuid4().hex[:8]}"
    tipo_payload = {
        "tipo_evento": unique_tipo,
        "descripcion_evento": "Inactive test",
        "activo": False,
    }
    integration_client.post("/tipo-eventos", json=tipo_payload)

    evento_payload = {
        "tipo_evento": unique_tipo,
        "latitud": -33.45,
        "longitud": -70.66,
    }
    res = integration_client.post("/eventos", json=evento_payload)
    assert res.status_code == 400


@pytest.mark.integration
def test_evento_geo_bounds_integration(integration_client):
    """Events can be created with valid geo coordinates."""
    valid_payloads = [
        {"tipo_evento": "robo", "latitud": -33.45, "longitud": -70.66},
        {"tipo_evento": "robo", "latitud": 0.0, "longitud": 0.0},
        {"tipo_evento": "robo", "latitud": 90.0, "longitud": 180.0},
        {"tipo_evento": "robo", "latitud": -90.0, "longitud": -180.0},
    ]
    for payload in valid_payloads:
        res = integration_client.post("/eventos", json=payload)
        assert res.status_code == 201, f"Failed for {payload}"


@pytest.mark.integration
def test_tipo_evento_crud_full_cycle_integration(integration_client):
    """Full CRUD cycle for tipo_evento: create, read, delete (soft), verify."""
    timestamp = int(time.time() * 1000)

    create_payload = {
        "tipo_evento": f"test_crud_{timestamp}",
        "descripcion_evento": "CRUD test",
        "activo": True,
        "puntuacion": 6.0,
    }
    res = integration_client.post("/tipo-eventos", json=create_payload)
    assert res.status_code == 201

    list_res = integration_client.get("/tipo-eventos?solo_activos=true")
    assert list_res.status_code == 200
    assert any(t["tipo_evento"] == f"test_crud_{timestamp}" for t in list_res.json())