"""Tests para los endpoints relacionados con eventos y tipos de evento.

Cubren:
- /eventos: listar (con cruce a TipoEventos), crear (caso ok / tipo invalido /
  campos faltantes / fallo de insercion) y eliminar (soft delete + 404).
- /tipo-eventos: listar (filtrando o no por activos) y crear (caso ok / fallo).
"""

import pytest


@pytest.fixture
def chained_select(mocker):
    """Helper para construir una cadena .select().eq().eq().limit().execute() con valor configurable."""

    def _make(data):
        chain = mocker.MagicMock()
        chain.execute.return_value.data = data
        return chain

    return _make


# -----------------------------------------------------------------------------
# /eventos GET
# -----------------------------------------------------------------------------

def test_list_eventos_enriches_with_tipo_data(client, mock_supabase):
    """GET /eventos debe enriquecer cada evento con datos del tipo asociado."""
    eventos_data = [
        {
            "id": 1,
            "tipo_evento": "robo",
            "latitud": -33.45,
            "longitud": -70.66,
            "activo": True,
        }
    ]
    tipos_data = [
        {
            "tipo_evento": "robo",
            "descripcion_evento": "Robo callejero",
            "evento_negativo": True,
            "puntuacion": 5,
            "radius": 50,
        }
    ]

    eventos_chain = mock_supabase.table.return_value.select.return_value.eq.return_value
    eventos_chain.execute.return_value.data = eventos_data

    tipos_chain = mock_supabase.table.return_value.select.return_value
    tipos_chain.execute.return_value.data = tipos_data

    res = client.get("/eventos")
    assert res.status_code == 200
    payload = res.json()
    assert len(payload) == 1
    assert payload[0]["descripcion_evento"] == "Robo callejero"
    assert payload[0]["evento_negativo"] is True
    assert payload[0]["puntuacion"] == 5
    assert payload[0]["radius"] == 50


def test_list_eventos_empty(client, mock_supabase):
    """GET /eventos debe devolver lista vacia cuando no hay datos."""
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    mock_supabase.table.return_value.select.return_value.execute.return_value.data = []

    res = client.get("/eventos")
    assert res.status_code == 200
    assert res.json() == []


# -----------------------------------------------------------------------------
# /eventos POST
# -----------------------------------------------------------------------------

def test_create_evento_missing_fields(client):
    """422 cuando faltan campos requeridos."""
    res = client.post("/eventos", json={"tipo_evento": "test"})
    assert res.status_code == 422


def test_create_evento_invalid_tipo(client, mock_supabase):
    """400 cuando tipo_evento no existe o esta inactivo."""
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data = []

    res = client.post(
        "/eventos",
        json={"tipo_evento": "no_existe", "latitud": -33.45, "longitud": -70.66},
    )
    assert res.status_code == 400
    assert "tipo de evento" in res.json()["detail"].lower()


def test_create_evento_success(client, mock_supabase):
    """201 con enriquecimiento de tipo cuando la insercion es exitosa."""
    check_chain = mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value
    check_chain.execute.return_value.data = [{"tipo_evento": "robo"}]

    insert_chain = mock_supabase.table.return_value.insert.return_value
    insert_chain.execute.return_value.data = [
        {
            "id": 10,
            "tipo_evento": "robo",
            "latitud": -33.45,
            "longitud": -70.66,
            "activo": True,
        }
    ]

    tipo_chain = mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value
    tipo_chain.execute.return_value.data = [
        {
            "descripcion_evento": "Robo callejero",
            "evento_negativo": True,
            "puntuacion": 5,
            "radius": 50,
        }
    ]

    res = client.post(
        "/eventos",
        json={"tipo_evento": "robo", "latitud": -33.45, "longitud": -70.66},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["id"] == 10
    assert body["descripcion_evento"] == "Robo callejero"
    assert body["evento_negativo"] is True


def test_create_evento_insert_returns_no_data(client, mock_supabase):
    """500 cuando la insercion no devuelve filas."""
    check_chain = mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value
    check_chain.execute.return_value.data = [{"tipo_evento": "robo"}]

    insert_chain = mock_supabase.table.return_value.insert.return_value
    insert_chain.execute.return_value.data = []

    res = client.post(
        "/eventos",
        json={"tipo_evento": "robo", "latitud": -33.45, "longitud": -70.66},
    )
    assert res.status_code == 500


# -----------------------------------------------------------------------------
# /eventos DELETE
# -----------------------------------------------------------------------------

def test_delete_evento_not_found(client, mock_supabase):
    """404 cuando el evento no existe."""
    mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = []

    res = client.delete("/eventos/999")
    assert res.status_code == 404


def test_delete_evento_success(client, mock_supabase):
    """204 (No Content) en soft delete exitoso."""
    mock_supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = [
        {"id": 1}
    ]

    res = client.delete("/eventos/1")
    assert res.status_code == 204


# -----------------------------------------------------------------------------
# /tipo-eventos GET
# -----------------------------------------------------------------------------

def test_list_tipo_eventos_solo_activos(client, mock_supabase):
    """GET /tipo-eventos por defecto filtra activo=True."""
    chain = mock_supabase.table.return_value.select.return_value.eq.return_value
    chain.execute.return_value.data = [
        {
            "tipo_evento": "robo",
            "descripcion_evento": "Robo",
            "activo": True,
        }
    ]

    res = client.get("/tipo-eventos")
    assert res.status_code == 200
    assert res.json()[0]["tipo_evento"] == "robo"
    mock_supabase.table.return_value.select.return_value.eq.assert_called_with("activo", True)


def test_list_tipo_eventos_todos(client, mock_supabase):
    """GET /tipo-eventos?solo_activos=false devuelve tambien inactivos."""
    chain = mock_supabase.table.return_value.select.return_value
    chain.execute.return_value.data = [
        {"tipo_evento": "robo", "descripcion_evento": "Robo", "activo": True},
        {"tipo_evento": "viejo", "descripcion_evento": "Viejo", "activo": False},
    ]

    res = client.get("/tipo-eventos?solo_activos=false")
    assert res.status_code == 200
    assert len(res.json()) == 2


# -----------------------------------------------------------------------------
# /tipo-eventos POST
# -----------------------------------------------------------------------------

def test_create_tipo_evento_success(client, mock_supabase):
    """201 al crear un nuevo tipo de evento."""
    insert_chain = mock_supabase.table.return_value.insert.return_value
    insert_chain.execute.return_value.data = [
        {
            "tipo_evento": "incendio",
            "descripcion_evento": "Incendio",
            "activo": True,
        }
    ]

    res = client.post(
        "/tipo-eventos",
        json={
            "tipo_evento": "incendio",
            "descripcion_evento": "Incendio",
            "activo": True,
        },
    )
    assert res.status_code == 201
    assert res.json()["tipo_evento"] == "incendio"


def test_create_tipo_evento_no_data_returned(client, mock_supabase):
    """500 cuando la insercion no devuelve filas."""
    insert_chain = mock_supabase.table.return_value.insert.return_value
    insert_chain.execute.return_value.data = []

    res = client.post(
        "/tipo-eventos",
        json={"tipo_evento": "incendio", "descripcion_evento": "Incendio"},
    )
    assert res.status_code == 500


def test_create_tipo_evento_missing_fields(client):
    """422 cuando faltan campos requeridos."""
    res = client.post("/tipo-eventos", json={})
    assert res.status_code == 422


# -----------------------------------------------------------------------------
# Camino de error 503 cuando Supabase no esta configurado
# -----------------------------------------------------------------------------

def test_endpoint_returns_503_when_supabase_not_configured(client_no_supabase, monkeypatch):
    """Si SUPABASE_URL/KEY no estan definidos, _supabase_dep debe propagar 503."""
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_KEY", raising=False)

    res = client_no_supabase.get("/tipo-eventos")
    assert res.status_code == 503
    assert "SUPABASE_URL" in res.json()["detail"]
