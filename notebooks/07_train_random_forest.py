
import pandas as pd

from src.data.preprocessing import (
    load_dataset,
    prepare_dataset,
)

from src.data.validation import create_grouped_splits
from src.models.train import build_model_pipeline
from src.models.evaluate import evaluate_model


print("=" * 65)
print("KRISHIMITRA AI - RANDOM FOREST TRAINING")
print("=" * 65)

# 1. Load dataset
df = load_dataset()
X, y, metadata = prepare_dataset(df)

print("\nDataset:", X.shape)
print("Crop classes:", y.nunique())

# 2. Generate district-grouped folds
splits = create_grouped_splits(
    X,
    y,
    metadata,
    n_splits=5,
    random_state=42
)

# 3. Train and evaluate
fold_results = []

for fold_number, (train_idx, test_idx) in enumerate(
    splits,
    start=1
):

    print(f"\nTraining Fold {fold_number}...")

    X_train = X.iloc[train_idx]
    X_test = X.iloc[test_idx]

    y_train = y.iloc[train_idx]
    y_test = y.iloc[test_idx]

    model = build_model_pipeline()

    model.fit(X_train, y_train)

    results = evaluate_model(
        model,
        X_test,
        y_test
    )

    fold_results.append(results)

    print("Accuracy:", round(results["accuracy"], 4))
    print(
        "Balanced Accuracy:",
        round(results["balanced_accuracy"], 4)
    )
    print("Macro-F1:", round(results["macro_f1"], 4))
    print(
        "Top-3 Accuracy:",
        round(results["top_3_accuracy"], 4)
    )

# 4. Calculate average performance
results_df = pd.DataFrame(fold_results)

print("\n" + "=" * 65)
print("CROSS-VALIDATION RESULTS")
print("=" * 65)

print("\nMean scores:")
print(results_df.mean().round(4).to_string())

print("\nStandard deviation:")
print(results_df.std().round(4).to_string())

# 5. Save results
results_df.to_csv(
    "documentation/random_forest_cv_results.csv",
    index=False
)

print("\nResults saved to documentation/random_forest_cv_results.csv")
print("\nTRAINING COMPLETE")
