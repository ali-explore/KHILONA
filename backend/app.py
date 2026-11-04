"""KHILONA API.

Local dev:  uvicorn app:app --reload --port 8000 (from backend/)
Production: uvicorn app:app --host 0.0.0.0 --port $PORT
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path so modules resolve correctly
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from prediction import (ALLOWED_TYPES, InvalidImageError, ModelUnavailableError,
                        Predictor, load_metrics)

MAX_BYTES = 10 * 1024 * 1024

app = FastAPI(title="KHILONA Smart Sorting API", version="1.0.0")

# Localhost origins preserved for local development
DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

# Read configured frontend origins (e.g. deployed Vercel frontend)
frontend_origin_env = os.getenv("FRONTEND_ORIGIN", "").strip()
allowed_origins = list(DEFAULT_ORIGINS)

if frontend_origin_env:
    for origin in frontend_origin_env.split(","):
        cleaned = origin.strip().rstrip("/")
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = Predictor()


@app.get("/")
def root():
    return {
        "service": "KHILONA Smart Sorting API",
        "status": "online",
        "model_loaded": predictor.ready,
        "docs_url": "/docs",
        "health_url": "/api/health",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model_loaded": predictor.ready,
        "classes": predictor.class_names,
        "detail": predictor.error,
    }


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(415, "Unsupported file type. Use JPG, JPEG or PNG.")
    data = await file.read()
    if not data:
        raise HTTPException(400, "The uploaded file is empty.")
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image is larger than 10 MB.")
    try:
        return predictor.predict(data)
    except ModelUnavailableError as exc:
        raise HTTPException(503, str(exc))
    except InvalidImageError as exc:
        raise HTTPException(400, str(exc))


@app.get("/api/metrics")
def metrics():
    return load_metrics()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
