"""KrishiMitra AI — FastAPI service.

Run from the project root so the existing `src` package imports unchanged:

    .venv/Scripts/python.exe -m uvicorn backend.app.main:app --port 8000
"""

from __future__ import annotations

import platform
from contextlib import asynccontextmanager

import sklearn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .routers import catalog_router, meta_router, predict_router
from .state import InputError, get_state, load_state


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_state()
    yield


app = FastAPI(
    title="KrishiMitra AI API",
    description=(
        "Read-only inference over the project's existing Random Forest model. "
        "Scores are historical classifier outputs, not crop-success probabilities."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(InputError)
async def handle_input_error(request: Request, exc: InputError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.get("/api/health", tags=["health"])
def health() -> dict:
    state = get_state()
    return {
        "status": "ok",
        "model_loaded": True,
        "python": platform.python_version(),
        "scikit_learn": sklearn.__version__,
        "records": state["dataset"]["records"],
        "classes": len(state["classes"]),
        "practices": len(state["practices"]),
    }


app.include_router(meta_router)
app.include_router(predict_router)
app.include_router(catalog_router)
