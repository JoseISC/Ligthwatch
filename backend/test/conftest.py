"""Fixtures comunes para los tests del backend.

- Anade `backend/app` al sys.path para que los tests importen `main` y
  `supabase_client` igual que lo hace la aplicacion en produccion.
- Aisla cada test del cliente real de Supabase y del cache global del modulo,
  reemplazando la dependencia `_supabase_dep` por un MagicMock.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app"))

import pytest
from fastapi.testclient import TestClient

import supabase_client
from main import _supabase_dep, app


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
