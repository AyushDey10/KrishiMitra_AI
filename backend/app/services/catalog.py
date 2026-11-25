"""Catalogue services: crops, practices, metrics and platform metadata."""

from __future__ import annotations

from ..state import get_state
from .field_meta import OBSERVED_FIELDS, describe_field


def meta() -> dict:
    state = get_state()

    return {
        "seasons": state["seasons"],
        "features": state["features"],
        "primary_fields": state["primary_fields"],
        "observed_fields": [describe_field(key) for key in OBSERVED_FIELDS],
        "crops": state["crops"],
        "crop_counts": {
            crop: state["crop_stats"][crop]["n"] for crop in state["crops"]
        },
        "dataset": state["dataset"],
        "method": {
            "model": "RandomForestClassifier (300 trees)",
            "features": len(state["numeric_features"]) + 1,
            "classes": len(state["classes"]),
            "validation": "5-fold stratified group CV by district",
        },
        "practices_count": len(state["practices"]),
        "disclaimers": state["disclaimers"],
    }


def metrics() -> dict:
    state = get_state()
    return {
        "means": state["metrics"]["means"],
        "folds": state["metrics"]["folds"],
        "feature_importance": state["metrics"]["feature_importance"],
        "source": state["metrics"]["source"],
        "dataset": state["dataset"],
    }


def feature_importance(key: str) -> dict | None:
    """Return presentation metadata for a feature key, if it is known."""
    state = get_state()
    for feature in state["features"]:
        if feature["key"] == key:
            return feature
    return None


def _practice_index() -> dict[str, list[str]]:
    """Map lower-cased crop name -> practice ids, from the knowledge base."""
    state = get_state()
    index: dict[str, list[str]] = {}
    for practice in state["practices"]:
        for crop in practice.get("associated_crops", []):
            index.setdefault(crop.strip().lower(), []).append(practice["id"])
    return index


def practices(crops: list[str] | None = None, region: str | None = None) -> dict:
    state = get_state()
    items = state["practices"]

    if crops:
        wanted = {crop.strip().lower() for crop in crops}
        items = [
            practice
            for practice in items
            if wanted.intersection(
                crop.strip().lower()
                for crop in practice.get("associated_crops", [])
            )
        ]

    if region:
        items = [
            practice
            for practice in items
            if practice["region"].lower() == region.strip().lower()
            or practice["state"].lower() == region.strip().lower()
        ]

    return {
        "count": len(items),
        "items": items,
        "filters": {
            "crops": sorted(
                {
                    crop
                    for practice in state["practices"]
                    for crop in practice.get("associated_crops", [])
                }
            ),
            "regions": sorted(
                {practice["region"] for practice in state["practices"]}
            ),
            "states": sorted(
                {practice["state"] for practice in state["practices"]}
            ),
        },
        "matching": (
            "Practices are matched by documented crop association only. "
            "Geographic and farm-condition matching is not implemented."
        ),
    }


def crops() -> dict:
    state = get_state()
    index = _practice_index()

    class_f1 = {
        item["crop"]: item["f1"] for item in state["metrics"]["classes"]
    }
    class_metrics = {
        item["crop"]: item for item in state["metrics"]["classes"]
    }

    items = []
    for crop in state["crops"]:
        stats = state["crop_stats"][crop]
        items.append(
            {
                "crop": crop,
                "n": stats["n"],
                "share": stats["share"],
                "conditions": stats["conditions"],
                "class_f1": class_f1.get(crop),
                "metrics": class_metrics.get(crop),
                "practices": index.get(crop.strip().lower(), []),
            }
        )

    return {
        "count": len(items),
        "items": items,
        "observed_fields": [describe_field(key) for key in OBSERVED_FIELDS],
        "disclaimers": state["disclaimers"],
    }


def crop(crop_name: str) -> dict | None:
    for item in crops()["items"]:
        if item["crop"].lower() == crop_name.strip().lower():
            return item
    return None
