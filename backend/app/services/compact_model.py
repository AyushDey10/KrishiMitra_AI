"""Compact Random Forest inference adapter for KrishiMitra AI."""

from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import numba
from scipy import sparse


@numba.njit
def _predict_compact(
    X,
    left,
    right,
    features,
    thresholds,
    leaf_offsets,
    classes,
    probabilities,
    node_offsets,
):
    result = np.zeros((X.shape[0], 32), dtype=np.float64)

    for i in range(X.shape[0]):
        for t in range(len(node_offsets) - 1):
            tree_start = node_offsets[t]
            node = tree_start

            while left[node] != -1:
                feature_index = features[node]

                if X[i, feature_index] <= thresholds[node]:
                    node = tree_start + left[node]
                else:
                    node = tree_start + right[node]

            for position in range(
                leaf_offsets[node],
                leaf_offsets[node + 1],
            ):
                result[i, classes[position]] += probabilities[position]

    result /= len(node_offsets) - 1
    return result


class CompactClassifier:
    """Expose the fitted classifier's class labels."""

    def __init__(self, classes: np.ndarray):
        self.classes_ = classes


class CompactRandomForest:
    """Pipeline-compatible wrapper around the compact forest."""

    def __init__(
        self,
        arrays: dict[str, np.ndarray],
        preprocessor,
    ):
        self.arrays = arrays
        self.preprocessor = preprocessor

        self.named_steps = {
            "preprocessor": preprocessor,
            "classifier": CompactClassifier(
                arrays["model_classes"]
            ),
        }

    def predict_proba(self, input_data):
        transformed = self.preprocessor.transform(input_data)

        if sparse.issparse(transformed):
            transformed = transformed.toarray()

        transformed = np.asarray(
            transformed,
            dtype=np.float32,
        )

        a = self.arrays

        return _predict_compact(
            transformed,
            a["left"],
            a["right"],
            a["features"],
            a["thresholds"],
            a["leaf_offsets"],
            a["classes"],
            a["probabilities"],
            a["node_offsets"],
        )


def load_compact_model(
    arrays_path: str | Path,
    preprocessor_path: str | Path,
) -> CompactRandomForest:
    """Load compact forest arrays and the fitted preprocessing pipeline."""

    arrays_path = Path(arrays_path)
    preprocessor_path = Path(preprocessor_path)

    if not arrays_path.is_file():
        raise FileNotFoundError(
            f"Compact forest not found: {arrays_path}"
        )

    if not preprocessor_path.is_file():
        raise FileNotFoundError(
            f"Compact preprocessor not found: {preprocessor_path}"
        )

    with np.load(arrays_path, allow_pickle=True) as data:
        arrays = {
            key: data[key]
            for key in data.files
        }

    preprocessor = joblib.load(preprocessor_path)

    required = {
        "left",
        "right",
        "features",
        "thresholds",
        "leaf_offsets",
        "classes",
        "probabilities",
        "node_offsets",
        "model_classes",
    }

    missing = required - arrays.keys()

    if missing:
        raise ValueError(
            "Compact model is missing arrays: "
            + ", ".join(sorted(missing))
        )

    if len(arrays["model_classes"]) != 32:
        raise ValueError(
            "Expected 32 crop classes in compact model."
        )

    if len(arrays["node_offsets"]) != 301:
        raise ValueError(
            "Expected exactly 300 trees in compact model."
        )

    return CompactRandomForest(
        arrays=arrays,
        preprocessor=preprocessor,
    )


