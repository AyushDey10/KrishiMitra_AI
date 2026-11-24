import pandas as pd

path = "data/raw/india_district_crop_dataset_1997_2015.csv"
df = pd.read_csv(path, low_memory=False)

print("=" * 65)
print("KRISHIMITRA AI - YEAR COVERAGE ANALYSIS")
print("=" * 65)

# 1. Records by year and season
print("\n1. YEAR-SEASON RECORD COUNTS")

year_season = pd.crosstab(df["crop_year"], df["season"])
print(year_season.to_string())

# 2. District coverage by year
print("\n2. UNIQUE DISTRICTS PER YEAR")

districts = df.groupby("crop_year")["district_key"].nunique()
print(districts.to_string())

# 3. Compare 2015 with previous years
print("\n3. 2015 RECORD DETAILS")

data_2015 = df[df["crop_year"] == 2015]

print(f"Total records: {len(data_2015)}")
print(f"Unique districts: {data_2015['district_key'].nunique()}")

print("\nSeason distribution:")
print(data_2015["season"].value_counts().to_string())

print("\nStates represented:")
print(data_2015["state"].nunique())

print("\nRecords by state:")
print(data_2015["state"].value_counts().to_string())

# 4. Check class distribution in 2015
print("\n4. CROPS RECORDED IN 2015")
print(data_2015["dominant_crop"].value_counts().to_string())

# 5. Compare sample coverage
print("\n5. YEARLY RECORD COUNT SUMMARY")
print(df.groupby("crop_year").size().describe().to_string())

# 6. Count records retained under the 100-sample rule
print("\n6. PROPOSED 100-SAMPLE CLASS FILTER")

crop_counts = df["dominant_crop"].value_counts()
eligible = crop_counts[crop_counts >= 100].index

filtered = df[df["dominant_crop"].isin(eligible)]

print(f"Original records: {len(df)}")
print(f"Eligible crop classes: {len(eligible)}")
print(f"Retained records: {len(filtered)}")
print(f"Excluded records: {len(df) - len(filtered)}")
print(f"Excluded percentage: {(len(df) - len(filtered)) / len(df) * 100:.2f}%")

print("\n" + "=" * 65)
print("YEAR COVERAGE ANALYSIS COMPLETE")
print("=" * 65)
