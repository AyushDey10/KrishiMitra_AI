
import numpy as np

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    top_k_accuracy_score,
)


def evaluate_model(model, X_test, y_test):
    """
    Evaluate a trained classification pipeline.
    """

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)

    classes = model.named_steps["classifier"].classes_

    results = {
        "accuracy": accuracy_score(
            y_test,
            predictions
        ),

        "balanced_accuracy": balanced_accuracy_score(
            y_test,
            predictions
        ),

        "macro_f1": f1_score(
            y_test,
            predictions,
            average="macro",
            zero_division=0
        ),

        "top_3_accuracy": top_k_accuracy_score(
            y_test,
            probabilities,
            k=3,
            labels=classes
        ),
    }

    return results
