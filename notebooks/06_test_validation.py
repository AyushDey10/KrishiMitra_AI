
from src.data.preprocessing import (
    load_dataset,
    prepare_dataset,
)

from src.data.validation import create_grouped_splits


print("=" * 65)
print("KRISHIMITRA AI - GROUPED VALIDATION TEST")
print("=" * 65)

# Load and prepare dataset
df = load_dataset()
X, y, metadata = prepare_dataset(df)

# Generate five validation folds
splits = create_grouped_splits(
    X,
    y,
    metadata,
    n_splits=5,
    random_state=42
)

print("\nTotal records:", len(X))
print("Total districts:", metadata["district_key"].nunique())
print("Total crop classes:", y.nunique())
print("Number of folds:", len(splits))

all_classes = set(y.unique())

# Examine each fold
for fold_number, (train_idx, test_idx) in enumerate(splits, start=1):

    train_groups = set(
        metadata.iloc[train_idx]["district_key"]
    )

    test_groups = set(
        metadata.iloc[test_idx]["district_key"]
    )

    overlap = train_groups.intersection(test_groups)

    train_classes = set(y.iloc[train_idx].unique())
    test_classes = set(y.iloc[test_idx].unique())

    missing_classes = all_classes - test_classes

    print(f"\n{'-' * 50}")
    print(f"FOLD {fold_number}")
    print(f"{'-' * 50}")

    print("Training records:", len(train_idx))
    print("Testing records:", len(test_idx))

    print("Training districts:", len(train_groups))
    print("Testing districts:", len(test_groups))

    print("District overlap:", len(overlap))
    print("Training crop classes:", len(train_classes))
    print("Testing crop classes:", len(test_classes))
    print("Missing test classes:", len(missing_classes))

    if overlap:
        print("ERROR: District leakage detected!")
    else:
        print("PASS: No district leakage.")

    if missing_classes:
        print("Classes missing from test:", sorted(missing_classes))

print("\nVALIDATION TEST COMPLETE")
