"""HTTP routers for the KrishiMitra API."""

from __future__ import annotations

from fastapi import APIRouter, Query

from .schemas import PredictRequest, ScenarioRequest
from .services import catalog, inference

router = APIRouter(prefix="/api")

# ---------------------------------------------------------------- meta
meta_router = APIRouter(prefix="/api", tags=["meta"])


@meta_router.get("/meta")
def get_meta() -> dict:
    """Seasons, feature definitions, crops and dataset facts."""
    return catalog.meta()


@meta_router.get("/metrics")
def get_metrics() -> dict:
    """Evaluation metrics and feature importance, read from documentation/."""
    return catalog.metrics()


# ------------------------------------------------------------- predict
predict_router = APIRouter(prefix="/api", tags=["crop-intelligence"])


@predict_router.post("/predict")
def post_predict(request: PredictRequest) -> dict:
    """Top historical crop patterns for a soil/season profile."""
    return inference.predict(
        features=request.features,
        season=request.season,
        top_n=request.top_n,
    )


@predict_router.post("/scenario")
def post_scenario(request: ScenarioRequest) -> dict:
    """Baseline versus rainfall-perturbed model output."""
    return inference.scenario(
        features=request.features,
        season=request.season,
        rainfall_change_pct=request.rainfall_change_pct,
        top_n=request.top_n,
    )


# ------------------------------------------------------------- catalog
catalog_router = APIRouter(prefix="/api", tags=["catalog"])


@catalog_router.get("/crops")
def get_crops() -> dict:
    """Observed historical conditions and class-level metrics per crop."""
    return catalog.crops()


@catalog_router.get("/crops/{crop_name}")
def get_crop(crop_name: str) -> dict:
    result = catalog.crop(crop_name)
    if result is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail=f"Unknown crop: {crop_name}")
    return result


@catalog_router.get("/practices")
def get_practices(
    crops: list[str] | None = Query(default=None),
    region: str | None = Query(default=None),
) -> dict:
    """Documented indigenous practices, optionally filtered."""
    return catalog.practices(crops=crops, region=region)
