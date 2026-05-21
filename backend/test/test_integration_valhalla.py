"""
Integration tests for Valhalla using Testcontainers.
Requires Docker to be running.
"""
import pytest
import time
import requests

pytest.importorskip("testcontainers")


@pytest.fixture(scope="module")
def valhalla_container():
    """Start a Valhalla container for integration testing."""
    from testcontainers.core.container import DockerContainer

    # Using prebuilt tiles image - starts Valhalla directly
    container = DockerContainer("viktornr/valhalla-tiles:latest")
    container.with_exposed_ports(8002)

    container.start()

    # Wait for Valhalla to be ready
    for _ in range(30):  # Try for 5 minutes
        try:
            host = container.get_container_host_ip()
            port = container.get_exposed_port(8002)
            resp = requests.get(f"http://{host}:{port}/status", timeout=5)
            if resp.status_code == 200:
                break
        except:
            pass
        time.sleep(10)
    else:
        container.stop()
        pytest.skip("Valhalla container failed to start in time")

    yield container

    container.stop()


@pytest.fixture(scope="module")
def valhalla_url(valhalla_container):
    """Get the URL for the Valhalla container."""
    host = valhalla_container.get_container_host_ip()
    port = valhalla_container.get_exposed_port(8002)
    return f"http://{host}:{port}"


@pytest.fixture(scope="module")
def api_client(valhalla_url):
    """Create a test client with Valhalla URL pointing to the container."""
    import sys
    sys.path.insert(0, "app")

    # Patch the VALHALLA_URL before creating the app
    import app.main
    app.main.VALHALLA_URL = valhalla_url

    from fastapi.testclient import TestClient
    from app.main import app

    return TestClient(app)


@pytest.mark.integration
def test_valhalla_health(api_client):
    """Test that the health endpoint works with real Valhalla."""
    res = api_client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["valhalla"] == "ok"


@pytest.mark.integration
def test_route_pedestrian(api_client):
    """Test pedestrian routing with real Valhalla."""
    loc1 = {"lon": -71.553557, "lat": -33.013746}
    loc2 = {"lon": -71.548511, "lat": -33.014498}
    res = api_client.post("/route", json={
        "locations": [loc1, loc2],
        "costing": "pedestrian"
    })
    assert res.status_code == 200
    data = res.json()
    assert "trip" in data
    assert "legs" in data["trip"]
    assert len(data["trip"]["legs"]) > 0




