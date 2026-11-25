"""Pydantic request contracts for the KrishiMitra API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    season: str = Field(..., description="One of the six seasons seen in training.")
    features: dict[str, float] = Field(
        default_factory=dict,
        description=(
            "Any subset of the 32 model features. Missing numeric features fall "
            "back to dataset medians, exactly as the Streamlit dashboard does."
        ),
    )
    top_n: int = Field(default=3, ge=1, le=10)


class ScenarioRequest(PredictRequest):
    rainfall_change_pct: float = Field(
        ...,
        ge=-50,
        le=50,
        description="Percentage change applied to the resolved seasonal rainfall.",
    )
