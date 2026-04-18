import os
from flask import Flask
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase_schema = os.environ.get("SUPABASE_SCHEMA")

supabase: Client = create_client(
    supabase_url, 
    supabase_key,
    options=ClientOptions(
        schema=supabase_schema,
    )
)

@app.route('/')
def index():
    response = supabase.table('Incidentes').select("*").execute()
    todos = response.data

    html = '<h1>Incidentes</h1><ul>'
    for todo in todos:
        html += f'<li>{todo["tipo_incidente"]}</li>'
    html += '</ul>'

    return html

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)
