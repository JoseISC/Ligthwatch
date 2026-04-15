from fastapi import FastAPI
import httpx

app = FastAPI()

VALHALLA_URL = "http://valhalla:8002/route"

@app.get("/route")
async def get_route():
    payload = {
        "locations": [
            {"lat": -33.45, "lon": -70.66},
            {"lat": -33.44, "lon": -70.65}
        ],
        "costing": "auto"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(VALHALLA_URL, json=payload)

    return response.json()