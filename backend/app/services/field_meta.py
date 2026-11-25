"""Presentation metadata for the 32 model features.

Labels, units and help text are taken from documentation/DATA_DICTIONARY.csv.
This module adds nothing to the model — it only makes the existing feature
contract readable in a user interface.
"""

from __future__ import annotations

# key: (label, unit, group, decimals, step, help)
FIELD_META: dict[str, tuple[str, str, str, int, float, str]] = {
    # ---- Soil (20) -------------------------------------------------------
    "soil_ph_h2o_0_5cm": ("Soil pH", "pH", "Soil", 2, 0.01, "Soil pH in water, 0–5 cm depth."),
    "soil_ph_h2o_0_30cm": ("Soil pH", "pH", "Soil", 2, 0.01, "Soil pH in water, 0–30 cm depth."),
    "soil_total_n_g_kg_0_5cm": ("Total nitrogen", "g/kg", "Soil", 2, 0.01, "Total soil nitrogen, 0–5 cm."),
    "soil_total_n_g_kg_0_30cm": ("Total nitrogen", "g/kg", "Soil", 2, 0.01, "Total soil nitrogen, 0–30 cm."),
    "soil_soc_g_kg_0_5cm": ("Soil organic carbon", "g/kg", "Soil", 2, 0.1, "Organic carbon content, 0–5 cm."),
    "soil_soc_g_kg_0_30cm": ("Soil organic carbon", "g/kg", "Soil", 2, 0.1, "Organic carbon content, 0–30 cm."),
    "soil_cec_cmol_kg_0_5cm": ("Cation exchange capacity", "cmol(c)/kg", "Soil", 2, 0.1, "CEC, 0–5 cm."),
    "soil_cec_cmol_kg_0_30cm": ("Cation exchange capacity", "cmol(c)/kg", "Soil", 2, 0.1, "CEC, 0–30 cm."),
    "soil_clay_pct_0_5cm": ("Clay content", "%", "Soil", 1, 0.1, "Clay fraction, 0–5 cm."),
    "soil_clay_pct_0_30cm": ("Clay content", "%", "Soil", 1, 0.1, "Clay fraction, 0–30 cm."),
    "soil_sand_pct_0_5cm": ("Sand content", "%", "Soil", 1, 0.1, "Sand fraction, 0–5 cm."),
    "soil_sand_pct_0_30cm": ("Sand content", "%", "Soil", 1, 0.1, "Sand fraction, 0–30 cm."),
    "soil_silt_pct_0_5cm": ("Silt content", "%", "Soil", 1, 0.1, "Silt fraction, 0–5 cm."),
    "soil_silt_pct_0_30cm": ("Silt content", "%", "Soil", 1, 0.1, "Silt fraction, 0–30 cm."),
    "soil_bulk_density_kg_dm3_0_5cm": ("Bulk density", "kg/dm³", "Soil", 2, 0.01, "Bulk density of fine earth, 0–5 cm."),
    "soil_bulk_density_kg_dm3_0_30cm": ("Bulk density", "kg/dm³", "Soil", 2, 0.01, "Bulk density of fine earth, 0–30 cm."),
    "soil_org_c_density_kg_m3_0_5cm": ("Organic carbon density", "kg/m³", "Soil", 1, 0.1, "Organic carbon density, 0–5 cm."),
    "soil_org_c_density_kg_m3_0_30cm": ("Organic carbon density", "kg/m³", "Soil", 1, 0.1, "Organic carbon density, 0–30 cm."),
    "soil_coarse_frag_pct_0_5cm": ("Coarse fragments", "%", "Soil", 1, 0.1, "Volumetric coarse fragments, 0–5 cm."),
    "soil_coarse_frag_pct_0_30cm": ("Coarse fragments", "%", "Soil", 1, 0.1, "Volumetric coarse fragments, 0–30 cm."),
    # ---- Climate (11) ----------------------------------------------------
    "temp_mean_c": ("Mean temperature", "°C", "Climate", 1, 0.1, "Seasonal mean air temperature at 2 m."),
    "temp_max_c": ("Mean daily maximum", "°C", "Climate", 1, 0.1, "Seasonal mean of monthly maximum temperature."),
    "temp_min_c": ("Mean daily minimum", "°C", "Climate", 1, 0.1, "Seasonal mean of monthly minimum temperature."),
    "humidity_pct": ("Relative humidity", "%", "Climate", 1, 0.1, "Seasonal mean relative humidity at 2 m."),
    "rainfall_mm": ("Seasonal rainfall", "mm", "Climate", 1, 1.0, "Total precipitation over the season window."),
    "rain_days_proxy_mm_per_day": ("Rainfall intensity", "mm/day", "Climate", 2, 0.1, "Mean daily precipitation over the season."),
    "solar_mj_m2_day": ("Solar radiation", "MJ/m²/day", "Climate", 1, 0.1, "Mean all-sky shortwave radiation."),
    "wind_m_s": ("Wind speed", "m/s", "Climate", 2, 0.1, "Mean wind speed at 2 m."),
    "annual_rainfall_mm": ("Annual rainfall", "mm", "Climate", 1, 1.0, "Total precipitation, June to May."),
    "annual_temp_mean_c": ("Annual mean temperature", "°C", "Climate", 1, 0.1, "Mean temperature, June to May."),
    "annual_humidity_pct": ("Annual mean humidity", "%", "Climate", 1, 0.1, "Mean relative humidity, June to May."),
}

# The five inputs surfaced on the dashboard before the advanced section.
PRIMARY_FIELDS = [
    "soil_soc_g_kg_0_5cm",
    "soil_clay_pct_0_30cm",
    "rainfall_mm",
    "temp_mean_c",
    "humidity_pct",
]

# Features shown as "observed historical conditions" on Crop Intelligence.
OBSERVED_FIELDS = [
    "rainfall_mm",
    "temp_mean_c",
    "temp_max_c",
    "temp_min_c",
    "humidity_pct",
    "soil_ph_h2o_0_30cm",
    "soil_soc_g_kg_0_30cm",
    "soil_clay_pct_0_30cm",
    "annual_rainfall_mm",
]


def describe_field(key: str) -> dict:
    label, unit, group, decimals, step, help_text = FIELD_META[key]
    return {
        "key": key,
        "label": label,
        "unit": unit,
        "group": group,
        "decimals": decimals,
        "step": step,
        "help": help_text,
    }
