
from pathlib import Path

import joblib
import pandas as pd

from src.data.preprocessing import FEATURES


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = PROJECT_ROOT / "models" / "random_forest.joblib"


def load_model():
    """
    Load the trained Random Forest model.
    """

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained model not found: {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)


def predict_top_crops(model, input_data, top_n=3):
    """
    Predict the top historical crop patterns.

    Returns crop names and model probabilities.
    """

    if not isinstance(input_data, dict):
        raise TypeError("Input must be a dictionary.")

    missing_features = [
        feature
        for feature in FEATURES
        if feature not in input_data
    ]

    if missing_features:
        raise ValueError(
            f"Missing input features: {missing_features}"
        )

    input_df = pd.DataFrame(
        [input_data],
        columns=FEATURES
    )

    probabilities = model.predict_proba(input_df)[0]

    classes = model.named_steps[
        "classifier"
    ].classes_

    top_indices = probabilities.argsort()[::-1][:top_n]

    results = []

    for index in top_indices:
        results.append({
            "crop": classes[index],
            "probability": round(
                float(probabilities[index]) * 100,
                2
            )
        })

    return results
