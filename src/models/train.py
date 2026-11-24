
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from src.data.preprocessing import (
    SOIL_FEATURES,
    CLIMATE_FEATURES,
    CATEGORICAL_FEATURES,
)


NUMERIC_FEATURES = SOIL_FEATURES + CLIMATE_FEATURES


def build_model_pipeline():
    """
    Build the Random Forest classification pipeline.
    """

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numeric",
                "passthrough",
                NUMERIC_FEATURES
            ),
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                CATEGORICAL_FEATURES
            )
        ]
    )

    model = RandomForestClassifier(
        n_estimators=300,
        max_features="sqrt",
        min_samples_leaf=2,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", model)
        ]
    )

    return pipeline
