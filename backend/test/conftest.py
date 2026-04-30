import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app'))

import pytest
from fastapi.testclient import TestClient
from supabase_client import get_supabase
from main import app

@pytest.fixture
def mock_supabase(mocker):
    mock = mocker.MagicMock()
    return mock

@pytest.fixture
def client(mock_supabase):
    app.dependency_overrides[get_supabase] = lambda: mock_supabase
    yield TestClient(app)
    app.dependency_overrides.clear()
