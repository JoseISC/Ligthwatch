import os

from dotenv import load_dotenv
from supabase import Client, ClientOptions, create_client

load_dotenv()

_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        schema = os.environ.get("SUPABASE_SCHEMA", "public")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL y SUPABASE_KEY deben estar definidos")
        _supabase = create_client(
            url,
            key,
            options=ClientOptions(schema=schema),
        )
    return _supabase
