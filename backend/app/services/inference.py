"""Prediction and scenario services.

All machine-learning work is delegated to src.models.predict.predict_top_crops.
This module only validates, defaults and serialises.
"""

from __future__ import annotations

from src.models.predict import predict_top_crops
from src.recommendation.practice_engine import get_practices_for_crops

from ..state import InputError, clamp_inputs, get_state


def resolve_inputs(features: dict[str, float] | None, season: str) -> tuple[dict, list[dict]]:
    """Merge partial input with dataset medians and validate it."""

    state = get_state()

    if season not in state["seasons"]:
        raise InputError(
            f"Unknown season '{season}'. Expected one of: "
            + ", ".join(state["seasons"])
        )

    features = features or {}

    unknown = sorted(set(features) - set(state["medians"]))
    if unknown:
        raise InputError("Unknown input features: " + ", ".join(unknown))

    vector = dict(state["medians"])
    for key, value in features.items():
        vector[key] = float(value)

    vector, flags = clamp_inputs(vector)

    for key in state["numeric_features"]:
        value = float(vector[key])
        low = state["minimums"][key]
        high = state["maximums"][key]
        if value < low - 1e-9 or value > high + 1e-9:
            flags.append(
                {
                    "field": key,
                    "issue": "outside_observed_range",
                    "detail": (
                        f"{value:g} is outside the observed range "
                        f"{low:.3g}–{high:.3g} for this district-level dataset."
                    ),
                }
            )

    vector["season"] = season
    return vector, flags


def _ranked(model, vector: dict, top_n: int) -> list[dict]:
    results = predict_top_crops(model, vector, top_n=top_n)
    return [
        {"rank": index + 1, "crop": item["crop"], "score": item["probability"]}
        for index, item in enumerate(results)
    ]


def _observed_context(crops: list[str]) -> list[dict]:
    state = get_state()
    context = []
    for crop in crops:
        stats = state["crop_stats"].get(crop)
        if stats is None:
            continue
        context.append(
            {
                "crop": crop,
                "n": stats["n"],
                "share": stats["share"],
                "conditions": stats["conditions"],
                "class_f1": next(
                    (
                        item["f1"]
                        for item in state["metrics"]["classes"]
                        if item["crop"] == crop
                    ),
                    None,
                ),
            }
        )
    return context


def _method() -> dict:
    state = get_state()
    return {
        "model": "RandomForestClassifier (300 trees)",
        "features": len(state["numeric_features"]) + 1,
        "classes": len(state["classes"]),
        "training_records": state["dataset"]["records"],
        "validation": "5-fold stratified group CV by district",
    }


def predict(features: dict[str, float] | None, season: str, top_n: int = 3) -> dict:
    state = get_state()

    vector, flags = resolve_inputs(features, season)
    ranked = _ranked(state["model"], vector, top_n)
    crops = [item["crop"] for item in ranked]

    return {
        "season": season,
        "baseline": ranked,
        "resolved_inputs": {k: v for k, v in vector.items() if k != "season"},
        "input_flags": flags,
        "observed_context": _observed_context(crops),
        "practices": get_practices_for_crops(crops),
        "method": _method(),
        "disclaimers": state["disclaimers"],
    }


def scenario(
    features: dict[str, float] | None,
    season: str,
    rainfall_change_pct: float,
    top_n: int = 3,
) -> dict:
    """Reproduce app.py's rainfall perturbation through the same model."""

    state = get_state()

    vector, flags = resolve_inputs(features, season)

    baseline = _ranked(state["model"], vector, top_n)

    modified = dict(vector)
    original_rainfall = float(vector["rainfall_mm"])
    modified_rainfall = max(
        0.0, original_rainfall * (1 + rainfall_change_pct / 100)
    )
    modified["rainfall_mm"] = modified_rainfall

    perturbed = _ranked(state["model"], modified, top_n)

    return {
        "season": season,
        "rainfall_change_pct": rainfall_change_pct,
        "rainfall_original": round(original_rainfall, 2),
        "rainfall_modified": round(modified_rainfall, 2),
        "baseline": baseline,
        "scenario": perturbed,
        "delta": [
            {
                "rank": index + 1,
                "baseline_crop": baseline[index]["crop"],
                "baseline_score": baseline[index]["score"],
                "scenario_crop": perturbed[index]["crop"],
                "scenario_score": perturbed[index]["score"],
                "score_change": round(
                    perturbed[index]["score"] - baseline[index]["score"], 2
                ),
            }
            for index in range(min(len(baseline), len(perturbed)))
        ],
        "input_flags": flags,
        "practices": get_practices_for_crops(
            [item["crop"] for item in baseline]
        ),
        "method": _method(),
        "disclaimers": state["disclaimers"],
    }
