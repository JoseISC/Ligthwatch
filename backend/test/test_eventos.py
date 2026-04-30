import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.supabase_client import get_supabase

@pytest.fixture
def client():
    return TestClient(app)

def test_create_evento_missing_fields(client):
    """Test 422 when required fields are missing"""
    res = client.post("/eventos", json={"tipo_evento": "test"})
    assert res.status_code == 422

def test_delete_evento_not_found(client, mocker):
    """Test 404 when deleting non-existent evento"""
    mock_supabase = mocker.MagicMock()
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

    app.dependency_overrides[get_supabase] = lambda: mock_supabase

    res = client.delete("/eventos/999")
    assert res.status_code == 404
    app.dependency_overrides.clear()

def test_create_evento_invalid_tipo(client, mocker):
    """Test 400 when tipo_evento doesn't exist or is inactive"""
    mock_supabase = mocker.MagicMock()
    # Return empty data for tipo check (invalid tipo)
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data = []

    app.dependency_overrides[get_supabase] = lambda: mock_supabase

    res = client.post("/eventos", json={
        "tipo_evento": "invalid_tipo",
        "latitud": -33.45,
        "longitud": -70.66
    })
    assert res.status_code == 400
    app.dependency_overrides.clear()
