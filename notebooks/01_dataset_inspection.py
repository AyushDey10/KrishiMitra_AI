import pandas as pd
from pathlib import Path

file_path = Path("data/raw/india_district_crop_dataset_1997_2015.csv")

print("=" * 60)
print("KRISHIMITRA AI - DATASET INSPECTION")
print("=" * 60)

df = pd.read_csv(file_path)

print("\n1. DATASET DIMENSIONS")
print(f"Rows: {df.shape[0]}")
print(f"Columns: {df.shape[1]}")

print("\n2. COLUMN NAMES")
for i, column in enumerate(df.columns, start=1):
    print(f"{i}. {column}")

print("\n3. DATA TYPES")
print(df.dtypes.to_string())

print("\n4. MISSING VALUES")
missing = df.isnull().sum()
missing = missing[missing > 0].sort_values(ascending=False)

if missing.empty:
    print("No missing values found.")
else:
    print(missing.to_string())

print("\n5. DUPLICATE ROWS")
print(df.duplicated().sum())

print("\n6. FIRST FIVE RECORDS")
print(df.head().to_string())

print("\n7. TARGET COLUMN ANALYSIS")
if "dominant_crop" in df.columns:
    print(f"Unique crops: {df['dominant_crop'].nunique()}")
    print("\nTop 15 crops:")
    print(df["dominant_crop"].value_counts().head(15).to_string())
else:
    print("'dominant_crop' column not found. Check the actual column names.")

print("\n8. NUMERICAL SUMMARY")
print(df.describe().to_string())

print("\n" + "=" * 60)
print("INSPECTION COMPLETE")
print("=" * 60)
