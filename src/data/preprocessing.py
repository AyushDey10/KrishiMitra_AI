
from pathlib import Path

import pandas as pd


# Project paths
PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    PROJECT_ROOT
    / "data"
    / "raw"
    / "india_district_crop_dataset_1997_2015.csv"
)

# Dataset selection
MIN_CROP_RECORDS = 100
MAX_CROP_YEAR = 2014


# 20 soil features
SOIL_FEATURES = [
    "soil_ph_h2o_0_5cm",
    "soil_ph_h2o_0_30cm",
    "soil_total_n_g_kg_0_5cm",
    "soil_total_n_g_kg_0_30cm",
    "soil_soc_g_kg_0_5cm",
    "soil_soc_g_kg_0_30cm",
    "soil_cec_cmol_kg_0_5cm",
    "soil_cec_cmol_kg_0_30cm",
    "soil_clay_pct_0_5cm",
    "soil_clay_pct_0_30cm",
    "soil_sand_pct_0_5cm",
    "soil_sand_pct_0_30cm",
    "soil_silt_pct_0_5cm",
    "soil_silt_pct_0_30cm",
    "soil_bulk_density_kg_dm3_0_5cm",
    "soil_bulk_density_kg_dm3_0_30cm",
    "soil_org_c_density_kg_m3_0_5cm",
    "soil_org_c_density_kg_m3_0_30cm",
    "soil_coarse_frag_pct_0_5cm",
    "soil_coarse_frag_pct_0_30cm",
]

# 11 climate features
CLIMATE_FEATURES = [
    "temp_mean_c",
    "temp_max_c",
    "temp_min_c",
    "humidity_pct",
    "rainfall_mm",
    "rain_days_proxy_mm_per_day",
    "solar_mj_m2_day",
    "wind_m_s",
    "annual_rainfall_mm",
    "annual_temp_mean_c",
    "annual_humidity_pct",
]

CATEGORICAL_FEATURES = ["season"]

TARGET = "dominant_crop"

FEATURES = (
    SOIL_FEATURES
    + CLIMATE_FEATURES
    + CATEGORICAL_FEATURES
)


def load_dataset():
    """Load the original dataset."""
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}"
        )

    return pd.read_csv(DATA_PATH, low_memory=False)


def prepare_dataset(df):
    """
    Prepare the historical crop classification dataset.

    - Exclude incomplete 2015 records.
    - Retain crops with at least 100 records.
    - Select only approved model features.
    - Preserve district and year separately for validation.
    """

    required_columns = FEATURES + [
        TARGET,
        "crop_year",
        "district_key",
        "state",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    # Keep years 1997–2014
    data = df[
        df["crop_year"] <= MAX_CROP_YEAR
    ].copy()

    # Select crop classes with at least 100 records
    crop_counts = data[TARGET].value_counts()

    eligible_crops = crop_counts[
        crop_counts >= MIN_CROP_RECORDS
    ].index

    data = data[
        data[TARGET].isin(eligible_crops)
    ].copy()

    # Model inputs
    X = data[FEATURES].copy()

    # Classification target
    y = data[TARGET].copy()

    # Retain metadata for grouped and temporal evaluation
    metadata = data[
        ["district_key", "state", "crop_year"]
    ].copy()

    return X, y, metadata
