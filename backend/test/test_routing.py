import httpx
from unittest.mock import Mock, AsyncMock
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

def create_mock_client(mock_response=None, side_effect=None):
    """Create a mock httpx.AsyncClient that works as an async context manager"""
    mock_client = Mock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    if side_effect:
        mock_client.post = AsyncMock(side_effect=side_effect)
    else:
        mock_client.post = AsyncMock(return_value=mock_response)
    return mock_client

def test_route_valid(client, mocker):
    mock_response = mocker.Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "trip": {
            "legs": [{"shape": "_p~iF~ps|U_ulLnnqC_mqNvxq`@", "summary": {}, "status_message": "Found route"}],
            "summary": {},
            "status_message": "Found route between locations"
        }
    }
    mock_client = create_mock_client(mock_response)
    mocker.patch("httpx.AsyncClient", return_value=mock_client)

    res = client.post("/route", json={
        "locations": [{"lon": -70.66, "lat": -33.45}, {"lon": -70.65, "lat": -33.44}],
        "costing": "pedestrian"
    })
    assert res.status_code == 200
    data = res.json()
    assert "trip" in data

def test_route_valhalla_unreachable(client, mocker):
    mock_client = create_mock_client(side_effect=httpx.RequestError("Connection error"))
    mocker.patch("httpx.AsyncClient", return_value=mock_client)

    res = client.post("/route", json={
        "locations": [{"lon": -70.66, "lat": -33.45}, {"lon": -70.65, "lat": -33.44}],
        "costing": "pedestrian"
    })
    assert res.status_code == 503

def test_route_valhalla_error(client, mocker):
    mock_response = mocker.Mock()
    mock_response.status_code = 400
    mock_response.text = "Bad request"
    mock_response.raise_for_status = mocker.Mock(side_effect=httpx.HTTPStatusError("Bad request", request=mocker.Mock(), response=mock_response))
    mock_client = create_mock_client(mock_response)
    mocker.patch("httpx.AsyncClient", return_value=mock_client)

    res = client.post("/route", json={
        "locations": [{"lon": -70.66, "lat": -33.45}, {"lon": -70.65, "lat": -33.44}],
        "costing": "pedestrian"
    })
    assert res.status_code == 400

def test_route_exclude_polygons(client, mocker):
    mock_response = mocker.Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "trip": {
            "legs": [{"shape": "_p~iF~ps|U_ulLnnqC_mqNvxq`@", "summary": {}, "status_message": "Found route"}],
            "summary": {},
            "status_message": "Found route between locations"
        }
    }
    mock_client = create_mock_client(mock_response)
    mocker.patch("httpx.AsyncClient", return_value=mock_client)

    res = client.post("/route", json={
        "locations": [{"lon": -70.66, "lat": -33.45}, {"lon": -70.65, "lat": -33.44}],
        "costing": "pedestrian",
        "exclude_polygons": [[[-70.66, -33.45], [-70.65, -33.45], [-70.65, -33.44]]]
    })
    assert res.status_code == 200
