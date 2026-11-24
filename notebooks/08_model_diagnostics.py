
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
)

from src.data.preprocessing import (
    load_dataset,
    prepare_dataset,
)

from src.data.validation import create_grouped_splits
from src.models.train import build_model_pipeline


# Project directories
ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / "models"
DOCS_DIR = ROOT / "documentation"

MODELS_DIR.mkdir(exist_ok=True)
DOCS_DIR.mkdir(exist_ok=True)


print("=" * 65)
print("KRISHIMITRA AI - MODEL DIAGNOSTICS")
print("=" * 65)

# 1. Load data
df = load_dataset()
X, y, metadata = prepare_dataset(df)

print("\nDataset:", X.shape)
print("Crop classes:", y.nunique())

# 2. Generate grouped folds
splits = create_grouped_splits(
    X,
    y,
    metadata,
    n_splits=5,
    random_state=42
)

# 3. Generate out-of-fold predictions
oof_predictions = np.empty(len(y), dtype=object)

for fold_number, (train_idx, test_idx) in enumerate(
    splits,
    start=1
):
    print(f"\nRunning diagnostic fold {fold_number}/5...")

    model = build_model_pipeline()

    model.fit(
        X.iloc[train_idx],
        y.iloc[train_idx]
    )

    predictions = model.predict(X.iloc[test_idx])

    oof_predictions[test_idx] = predictions


# 4. Classification report
classes = sorted(y.unique())

report = classification_report(
    y,
    oof_predictions,
    labels=classes,
    output_dict=True,
    zero_division=0
)

report_df = pd.DataFrame.from_dict(
    {
        label: metrics
        for label, metrics in report.items()
        if isinstance(metrics, dict)
    },
    orient="index"
)

report_path = DOCS_DIR / "classification_report.csv"
report_df.to_csv(report_path)

print("\n" + "=" * 65)
print("CLASS-WISE PERFORMANCE")
print("=" * 65)

print(
    report_df.loc[classes][
        ["precision", "recall", "f1-score", "support"]
    ].round(3).to_string()
)

# 5. Confusion matrix
matrix = confusion_matrix(
    y,
    oof_predictions,
    labels=classes
)

matrix_df = pd.DataFrame(
    matrix,
    index=classes,
    columns=classes
)

matrix_path = DOCS_DIR / "confusion_matrix.csv"
matrix_df.to_csv(matrix_path)

print("\nClassification report saved:", report_path)
print("Confusion matrix saved:", matrix_path)


# 6. Train final model on all available records
print("\nTraining final model on the complete dataset...")

final_model = build_model_pipeline()
final_model.fit(X, y)

# 7. Save final model
model_path = MODELS_DIR / "random_forest.joblib"

joblib.dump(final_model, model_path)

print("Final model saved:", model_path)


# 8. Extract feature importance
feature_names = (
    final_model
    .named_steps["preprocessor"]
    .get_feature_names_out()
)

importance_values = (
    final_model
    .named_steps["classifier"]
    .feature_importances_
)

importance_df = pd.DataFrame({
    "feature": feature_names,
    "importance": importance_values
})

importance_df = importance_df.sort_values(
    "importance",
    ascending=False
)

importance_path = DOCS_DIR / "feature_importance.csv"

importance_df.to_csv(
    importance_path,
    index=False
)

print("\nTOP 15 FEATURES")
print(importance_df.head(15).to_string(index=False))

print("\nFeature importance saved:", importance_path)

print("\nMODEL DIAGNOSTICS COMPLETE")
