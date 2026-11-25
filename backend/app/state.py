"""Application state, built once at startup.

Nothing here changes the model or the preprocessing logic: the module imports
the existing project modules and derives read-only reference values from them.
"""

from __future__ import annotations

import math
from typing import Any

import pandas as pd

from src.data import preprocessing
from src.models import predict as predict_module
from src.recommendation.practice_engine import load_practices

from .config import PROJECT_ROOT, settings
from .services.field_meta import FIELD_META, OBSERVED_FIELDS

DOCS = PROJECT_ROOT / "documentation"

DISCLAIMERS = {
    "score": (
        "Model scores are classifier outputs over historical crop labels. "
        "They are not probabilities of crop success, yield or profitability."
    ),
    "context": (
        "Observed ranges are descriptive statistics of historical rows labelled "
        "with a crop (1997–2014, district level). They are not suitability thresholds."
    ),
    "scenario": (
        "A rainfall scenario shows how the model responds to a changed input. "
        "It is not a climate forecast or an agronomic impact assessment."
    ),
    "scope": (
        "KrishiMitra AI is a research prototype. It does not produce a validated "
        "crop suitability assessment and does not replace soil testing or local expertise."
    ),
}

_state: dict[str, Any] = {}


class InputError(ValueError):
    """Raised when a request cannot be answered with the trained model."""


def _apply_path_overrides() -> None:
    """Honour optional deployment overrides without editing src/."""
    if settings.model_path is not None:
        predict_module.MODEL_PATH = settings.model_path
    if settings.data_path is not None:
        preprocessing.DATA_PATH = settings.data_path


def _read_csv(name: str, index_col: int | None = None) -> pd.DataFrame:
    path = DOCS / name
    if not path.exists():
        raise FileNotFoundError(f"Documentation file not found: {path}")
    return pd.read_csv(path, index_col=index_col)


def _build_metrics() -> dict:
    importance = _read_csv("feature_importance.csv").sort_values(
        "importance", ascending=False
    )
    cv = _read_csv("random_forest_cv_results.csv")
    # The per-class report stores the crop name in its unnamed first column.
    report = _read_csv("classification_report.csv", index_col=0)

    classes = []
    for crop, row in report.iterrows():
        label = str(crop)
        if label.lower() in {"accuracy", "macro avg", "weighted avg"}:
            continue
        classes.append(
            {
                "crop": label,
                "precision": round(float(row["precision"]), 4),
                "recall": round(float(row["recall"]), 4),
                "f1": round(float(row["f1-score"]), 4),
                "support": int(row["support"]),
            }
        )

    feature_importance = []
    for _, row in importance.head(15).iterrows():
        feature_importance.append(
            {
                "key": str(row["feature"])
                .replace("numeric__", "")
                .replace("categorical__", ""),
                "importance": round(float(row["importance"]), 5),
            }
        )

    folds = [
        {
            "accuracy": round(float(row["accuracy"]), 4),
            "balanced_accuracy": round(float(row["balanced_accuracy"]), 4),
            "macro_f1": round(float(row["macro_f1"]), 4),
            "top_3_accuracy": round(float(row["top_3_accuracy"]), 4),
        }
        for _, row in cv.iterrows()
    ]

    means = {
        key: round(float(cv[key].mean()), 4)
        for key in ["accuracy", "balanced_accuracy", "macro_f1", "top_3_accuracy"]
    }

    return {
        "folds": folds,
        "means": means,
        "feature_importance": feature_importance,
        "classes": classes,
        "source": (
            "5-fold Stratified Group Cross-Validation, grouped by district. "
            "Values read from documentation/random_forest_cv_results.csv."
        ),
    }


def _build_reference() -> dict:
    df = preprocessing.load_dataset()
    X, y, metadata = preprocessing.prepare_dataset(df)

    numeric = preprocessing.SOIL_FEATURES + preprocessing.CLIMATE_FEATURES

    medians = {k: float(v) for k, v in X[numeric].median().items()}
    minimums = {k: float(v) for k, v in X[numeric].min().items()}
    maximums = {k: float(v) for k, v in X[numeric].max().items()}

    frame = X[numeric].copy()
    frame["__crop"] = y.values

    total = int(len(frame))
    crop_stats: dict[str, dict] = {}

    for crop, group in frame.groupby("__crop"):
        conditions = {}
        for feature in OBSERVED_FIELDS:
            series = group[feature].astype(float)
            conditions[feature] = {
                "p25": round(float(series.quantile(0.25)), 3),
                "median": round(float(series.median()), 3),
                "p75": round(float(series.quantile(0.75)), 3),
            }

        crop_stats[str(crop)] = {
            "crop": str(crop),
            "n": int(len(group)),
            "share": round(len(group) / total, 4),
            "conditions": conditions,
        }

    dataset = {
        "records": int(len(X)),
        "raw_records": int(len(df)),
        "districts": int(metadata["district_key"].nunique()),
        "states": int(metadata["state"].nunique()),
        "crop_classes": int(len(crop_stats)),
        "seasons": int(X["season"].nunique()),
        "year_start": int(metadata["crop_year"].min()),
        "year_end": int(metadata["crop_year"].max()),
    }

    return {
        "medians": medians,
        "minimums": minimums,
        "maximums": maximums,
        "numeric_features": numeric,
        "crop_stats": crop_stats,
        "crops": sorted(crop_stats.keys()),
        "dataset": dataset,
    }


def _build_features(reference: dict, primary: list[str]) -> list[dict]:
    features = []
    for key in reference["numeric_features"]:
        label, unit, group, decimals, step, help_text = FIELD_META[key]
        features.append(
            {
                "key": key,
                "label": label,
                "unit": unit,
                "group": group,
                "decimals": decimals,
                "step": step,
                "help": help_text,
                "median": reference["medians"][key],
                "min": reference["minimums"][key],
                "max": reference["maximums"][key],
                "primary": key in primary,
            }
        )
    return features


def load_state() -> dict:
    """Build (or return) the immutable application state."""

    if _state:
        return _state

    _apply_path_overrides()

    model = predict_module.load_model()

    seasons = [
        str(value)
        for value in model.named_steps["preprocessor"]
        .named_transformers_["categorical"]
        .categories_[0]
    ]

    reference = _build_reference()

    primary = [
        "soil_soc_g_kg_0_5cm",
        "soil_clay_pct_0_30cm",
        "rainfall_mm",
        "temp_mean_c",
        "humidity_pct",
    ]

    _state.update(
        {
            "model": model,
            "seasons": seasons,
            "features": _build_features(reference, primary),
            "primary_fields": primary,
            "classes": [
                str(c) for c in model.named_steps["classifier"].classes_
            ],
            "metrics": _build_metrics(),
            "practices": load_practices(),
            "disclaimers": DISCLAIMERS,
            **reference,
        }
    )

    return _state


def get_state() -> dict:
    if not _state:
        raise RuntimeError("Application state has not been initialised.")
    return _state


def clamp_inputs(vector: dict[str, float]) -> tuple[dict[str, float], list[dict]]:
    """Mirror the physical bounds used by app.py, and report every adjustment."""

    flags: list[dict] = []

    for key, value in vector.items():
        try:
            number = float(value)
        except (TypeError, ValueError):
            raise InputError(f"{key} must be a number.")
        if not math.isfinite(number):
            raise InputError(f"{key} must be a finite number.")

    rainfall = float(vector["rainfall_mm"])
    if rainfall < 0:
        vector["rainfall_mm"] = 0.0
        flags.append(
            {
                "field": "rainfall_mm",
                "issue": "adjusted",
                "detail": "Rainfall cannot be negative; set to 0 mm.",
            }
        )

    for key in vector:
        if key.endswith("_pct"):
            value = float(vector[key])
            bounded = min(100.0, max(0.0, value))
            if bounded != value:
                vector[key] = bounded
                flags.append(
                    {
                        "field": key,
                        "issue": "adjusted",
                        "detail": "Percentage inputs are bounded between 0 and 100.",
                    }
                )

    return vector, flags
