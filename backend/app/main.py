from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

VALHALLA_URL = "http://localhost:8002/route"

@app.post("/route")
async def route_proxy(body: dict):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            VALHALLA_URL,
            json=body
        )
        return res.json()