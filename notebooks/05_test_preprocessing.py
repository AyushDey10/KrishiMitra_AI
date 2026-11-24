import pandas as pd

from src.data.preprocessing import (
    load_dataset,
    prepare_dataset,
    FEATURES,
    SOIL_FEATURES,
    CLIMATE_FEATURES,
    CATEGORICAL_FEATURES,
)

print("=" * 65)
print("KRISHIMITRA AI - PREPROCESSING TEST")
print("=" * 65)

# Load original dataset
df = load_dataset()

print("\n1. ORIGINAL DATASET")
print("Shape:", df.shape)

# Prepare dataset
X, y, metadata = prepare_dataset(df)

print("\n2. PREPARED DATASET")
print("Feature shape:", X.shape)
print("Target shape:", y.shape)
print("Metadata shape:", metadata.shape)

print("\n3. FEATURE BREAKDOWN")
print("Soil features:", len(SOIL_FEATURES))
print("Climate features:", len(CLIMATE_FEATURES))
print("Categorical features:", len(CATEGORICAL_FEATURES))
print("Total features:", len(FEATURES))

print("\n4. TARGET INFORMATION")
print("Unique crop classes:", y.nunique())
print("Top 10 crops:")
print(y.value_counts().head(10).to_string())

print("\n5. YEAR RANGE")
print(metadata["crop_year"].min(), "to", metadata["crop_year"].max())

print("\n6. GEOGRAPHIC COVERAGE")
print("Districts:", metadata["district_key"].nunique())
print("States/UTs:", metadata["state"].nunique())

print("\n7. MISSING VALUES")
print("Missing feature values:", X.isnull().sum().sum())
print("Missing target values:", y.isnull().sum())

print("\n8. SEASONS")
print(X["season"].value_counts().to_string())

print("\n9. FINAL CHECK")

valid_dtypes = (
    "object",
    "str",
    "category",
)

all_valid = all(
    X[col].dtype.name in valid_dtypes
    or pd.api.types.is_numeric_dtype(X[col])
    for col in X.columns
)

print("All features numeric or categorical:", all_valid)
print("Feature data types:")
print(X.dtypes.value_counts().to_string())

print("\nPREPROCESSING TEST COMPLETE")
