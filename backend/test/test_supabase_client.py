import os
import pytest
from unittest.mock import patch
from supabase_client import get_supabase, _supabase

@pytest.fixture(autouse=True)
def reset_supabase_cache():
    """Reset the global _supabase variable before each test"""
    global _supabase
    from supabase_client import _supabase as supabase_var
    backup = supabase_var
    from supabase_client import _supabase
    import supabase_client
    supabase_client._supabase = None
    yield
    supabase_client._supabase = backup

def test_get_supabase_with_env_vars(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "test-key")
    monkeypatch.setenv("SUPABASE_SCHEMA", "test_schema")

    client = get_supabase()
    assert client is not None

def test_get_supabase_custom_schema(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "test-key")
    monkeypatch.setenv("SUPABASE_SCHEMA", "custom_schema")

    client = get_supabase()
    assert client is not None

def test_get_supabase_missing_env_vars(monkeypatch):
    # Clear env vars
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_KEY", raising=False)

    with pytest.raises(RuntimeError, match="SUPABASE_URL y SUPABASE_KEY deben estar definidos"):
        get_supabase()
