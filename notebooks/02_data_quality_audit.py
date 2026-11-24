import pandas as pd
from pathlib import Path

path = Path("data/raw/india_district_crop_dataset_1997_2015.csv")

# Read the dataset without mixed-type inference warnings
df = pd.read_csv(path, low_memory=False)

print("=" * 65)
print("KRISHIMITRA AI - DATA QUALITY AUDIT")
print("=" * 65)

# 1. Year coverage
print("\n1. CROP YEAR COVERAGE")
print(f"Minimum year: {df['crop_year'].min()}")
print(f"Maximum year: {df['crop_year'].max()}")
print(f"Unique years: {df['crop_year'].nunique()}")
print(df['crop_year'].value_counts().sort_index().to_string())

# 2. Season distribution
print("\n2. SEASON DISTRIBUTION")
print(df['season'].value_counts().to_string())

# 3. Crop class distribution
print("\n3. CROP CLASS DISTRIBUTION")
crop_counts = df['dominant_crop'].value_counts()

print(f"Total crop classes: {len(crop_counts)}")
print(f"Classes with at least 100 records: {(crop_counts >= 100).sum()}")
print(f"Classes with fewer than 100 records: {(crop_counts < 100).sum()}")

print("\n15 least frequent crops:")
print(crop_counts.tail(15).to_string())

print("\nCrop frequency summary:")
print(crop_counts.describe().to_string())

# 4. Check district-year-season uniqueness
print("\n4. DISTRICT-YEAR-SEASON UNIQUENESS")

key = ['district_key', 'crop_year', 'season']

duplicate_keys = df.duplicated(subset=key, keep=False)

print(f"Duplicate combinations: {duplicate_keys.sum()}")

if duplicate_keys.any():
    print("\nExamples:")
    print(df.loc[duplicate_keys, key + ['dominant_crop']].head(10).to_string())
else:
    print("Every district-year-season combination is unique.")

# 5. Soil imputation flag
print("\n5. SOIL IMPUTATION FLAG")

flag = df['soil_filled_from_nearest']

print("Non-null values:")
print(flag.dropna().value_counts().to_string())

print(f"Non-null rows: {flag.notna().sum()}")

print("\nRows with imputation flag:")
print(
    df.loc[
        flag.notna(),
        ['state', 'district', 'district_key', 'soil_filled_from_nearest']
    ].to_string(index=False)
)

# 6. Check whether soil measurements vary within districts
print("\n6. SOIL FEATURE CONSISTENCY")

soil_columns = [
    col for col in df.columns
    if col.startswith('soil_') and col != 'soil_filled_from_nearest'
]

variation = df.groupby('district_key')[soil_columns].nunique()

print(
    "Districts with any soil feature varying across records:",
    (variation > 1).any(axis=1).sum()
)

# 7. Check missing values in actual model input candidates
print("\n7. MISSING VALUES IN SOIL AND CLIMATE FEATURES")

candidate_columns = [
    col for col in df.columns
    if col.startswith('soil_')
    or col in [
        'season', 'temp_mean_c', 'temp_max_c', 'temp_min_c',
        'humidity_pct', 'rainfall_mm', 'rain_days_proxy_mm_per_day',
        'solar_mj_m2_day', 'wind_m_s', 'annual_rainfall_mm',
        'annual_temp_mean_c', 'annual_humidity_pct'
    ]
]

print(df[candidate_columns].isnull().sum().to_string())

print("\n" + "=" * 65)
print("DATA QUALITY AUDIT COMPLETE")
print("=" * 65)
