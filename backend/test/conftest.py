"""Fixtures comunes para los tests del backend.

- Anade `backend/app` al sys.path para que los tests importen `main` y
  `supabase_client` igual que lo hace la aplicacion en produccion.
- Aisla cada test del cliente real de Supabase y del cache global del modulo,
  reemplazando la dependencia `_supabase_dep` por un MagicMock.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app"))

import allure
import pytest
from fastapi.testclient import TestClient

import supabase_client
from main import _supabase_dep, app


def pytest_collection_modifyitems(config, items):
    """Aplica las etiquetas de Allure ("Backend (FastAPI)") a TODOS los tests
    recolectados, incluso los que terminan en estado `skipped` (los integration
    tests cuando Supabase local no esta corriendo). Si se aplicaran via fixture,
    los skipped no recibirian las etiquetas y aparecerian sueltos en el reporte.
    """
    backend_label = "Backend (FastAPI)"
    for item in items:
        item.add_marker(allure.epic(backend_label))
        item.add_marker(allure.parent_suite(backend_label))


@pytest.fixture(autouse=True)
def _reset_supabase_cache():
    """Asegura que el cache global del cliente Supabase no contamine entre tests."""
    supabase_client._supabase = None
    yield
    supabase_client._supabase = None


@pytest.fixture
def mock_supabase(mocker):
    """MagicMock que simula la API encadenable del cliente Supabase."""
    return mocker.MagicMock()


@pytest.fixture
def client(mock_supabase):
    """TestClient con la dependencia real de Supabase reemplazada por el mock."""
    app.dependency_overrides[_supabase_dep] = lambda: mock_supabase
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def client_no_supabase():
    """TestClient sin override (para forzar el camino de error 503)."""
    app.dependency_overrides.clear()
    yield TestClient(app)
    app.dependency_overrides.clear()


# -----------------------------------------------------------------------------
# Integration Test Fixtures
# -----------------------------------------------------------------------------

import subprocess
import time
import os
from supabase import create_client, Client


def pytest_configure(config):
    config.addinivalue_line("markers", "integration: mark test as integration test")


@pytest.fixture(scope="session")
def supabase_local():
    """Skip integration tests if Supabase isn't running."""
    import socket

    def is_port_open(host, port):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        try:
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except Exception:
            return False

    if not is_port_open("127.0.0.1", 54321):
        pytest.skip("Supabase local not running on port 54321")

    if not is_port_open("127.0.0.1", 54322):
        pytest.skip("Supabase database not running on port 54322")

    yield


@pytest.fixture(scope="session")
def supabase_client(supabase_local):
    """Create a real Supabase client connected to local instance."""
    import jwt

    jwt_secret = "super-secret-jwt-token-with-at-least-32-characters-long"
    payload = {"role": "anon", "iss": "supabase", "iat": 0, "exp": 9999999999}
    key = jwt.encode(payload, jwt_secret, algorithm="HS256")

    url = "http://127.0.0.1:54321"
    client = create_client(url, key)
    return client
    return client


@pytest.fixture
def db_transaction(supabase_client):
    """Wrap each test in a transaction that rolls back after."""
    from psycopg2 import connect
    with connect(
        host="127.0.0.1",
        port=54322,
        database="postgres",
        user="postgres",
        password="postgres",
    ) as conn:
        conn.autocommit = False
        cur = conn.cursor()

        cur.execute("BEGIN")
        try:
            yield cur
        finally:
            cur.execute("ROLLBACK")
            cur.close()
            conn.close()


@pytest.fixture
def integration_client(supabase_client):
    """TestClient with real Supabase client for integration tests."""
    from main import _supabase_dep

    app.dependency_overrides[_supabase_dep] = lambda: supabase_client

    client = TestClient(app)

    yield client

    app.dependency_overrides.clear()
