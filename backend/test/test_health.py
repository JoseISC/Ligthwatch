import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_health_ok(client, mocker):
    mock_response = mocker.Mock()
    mock_response.status_code = 200
    mocker.patch("httpx.AsyncClient.get", return_value=mock_response)
    
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["valhalla"] == "ok"

def test_health_valhalla_down(client, mocker):
    mock_response = mocker.Mock()
    mock_response.status_code = 500
    mocker.patch("httpx.AsyncClient.get", return_value=mock_response)
    
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["valhalla"] == "degraded"

def test_health_valhalla_unreachable(client, mocker):
    mocker.patch("httpx.AsyncClient.get", side_effect=Exception("Connection error"))
    
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["valhalla"] == "unreachable"
