import pandas as pd

path = "data/raw/india_district_crop_dataset_1997_2015.csv"
df = pd.read_csv(path, low_memory=False)

# Exclude the incomplete 2015 records from the primary analysis
df = df[df["crop_year"] <= 2014].copy()

print("=" * 70)
print("KRISHIMITRA AI - CROP GEOGRAPHIC REPRESENTATION")
print("=" * 70)

# 1. Dataset size after excluding 2015
print("\n1. PRIMARY DATASET")
print(f"Records: {len(df)}")
print(f"Years: {df['crop_year'].min()} to {df['crop_year'].max()}")
print(f"Districts: {df['district_key'].nunique()}")
print(f"States/UTs: {df['state'].nunique()}")

# 2. Crop frequency and geographic coverage
print("\n2. CROP FREQUENCY AND DISTRICT COVERAGE")

crop_stats = (
    df.groupby("dominant_crop")
    .agg(
        records=("dominant_crop", "size"),
        districts=("district_key", "nunique"),
        states=("state", "nunique")
    )
    .sort_values("records", ascending=False)
)

crop_stats["eligible_100"] = crop_stats["records"] >= 100

print(crop_stats.to_string())

# 3. Check whether the 32-class threshold still applies
eligible = crop_stats[crop_stats["eligible_100"]].index

print("\n3. CLASS FILTER SUMMARY")
print(f"Classes with at least 100 records: {len(eligible)}")
print(f"Classes below 100 records: {len(crop_stats) - len(eligible)}")

filtered = df[df["dominant_crop"].isin(eligible)]

print(f"Records retained: {len(filtered)}")
print(f"Records excluded: {len(df) - len(filtered)}")
print(
    f"Percentage retained: "
    f"{len(filtered) / len(df) * 100:.2f}%"
)

# 4. Check representation across seasons
print("\n4. ELIGIBLE CROP REPRESENTATION BY SEASON")

season_crop = pd.crosstab(
    filtered["dominant_crop"],
    filtered["season"]
)

print(season_crop.to_string())

# 5. Check representation across states
print("\n5. NUMBER OF STATES REPRESENTING EACH ELIGIBLE CROP")

state_coverage = (
    filtered.groupby("dominant_crop")["state"]
    .nunique()
    .sort_values()
)

print(state_coverage.to_string())

# 6. Identify crops represented in very few districts
print("\n6. CROPS FOUND IN FIVE OR FEWER DISTRICTS")

limited = crop_stats[
    (crop_stats["records"] >= 100)
    & (crop_stats["districts"] <= 5)
]

if limited.empty:
    print("None")
else:
    print(limited.to_string())

print("\n" + "=" * 70)
print("GEOGRAPHIC ANALYSIS COMPLETE")
print("=" * 70)
