
import streamlit as st
import pandas as pd

from src.recommendation.practice_engine import get_practices_for_crops

from src.data.preprocessing import (
    load_dataset,
    prepare_dataset,
    SOIL_FEATURES,
    CLIMATE_FEATURES,
    CATEGORICAL_FEATURES,
)

from src.models.predict import (
    load_model,
    predict_top_crops,
)


# --------------------------------------------------
# 1. PAGE CONFIGURATION
# --------------------------------------------------

st.set_page_config(
    page_title="KrishiMitra AI",
    page_icon="🌱",
    layout="wide"
)


# --------------------------------------------------
# 2. LOAD MODEL AND REFERENCE VALUES
# --------------------------------------------------

@st.cache_resource
def get_model():
    return load_model()


@st.cache_data
def get_reference_values():
    df = load_dataset()
    X, y, metadata = prepare_dataset(df)

    numerical_features = SOIL_FEATURES + CLIMATE_FEATURES

    medians = X[numerical_features].median()
    minimums = X[numerical_features].min()
    maximums = X[numerical_features].max()

    seasons = sorted(X["season"].unique().tolist())

    return medians, minimums, maximums, seasons


model = get_model()

medians, minimums, maximums, seasons = get_reference_values()


# --------------------------------------------------
# 3. INPUT VALIDATION
# --------------------------------------------------

def get_input_bounds(feature):
    minimum = float(minimums[feature])
    maximum = float(maximums[feature])

    # Rainfall cannot be negative.
    if feature == "rainfall_mm":
        minimum = max(0.0, minimum)

    # Percentage values must remain between 0 and 100.
    if feature.endswith("_pct"):
        minimum = max(0.0, minimum)
        maximum = min(100.0, maximum)

    return minimum, maximum


# --------------------------------------------------
# 4. DASHBOARD HEADER
# --------------------------------------------------

st.title("🌱 KrishiMitra AI")

st.subheader(
    "Intelligent Agricultural Decision Support System"
)

st.write(
    "Explore historical crop patterns using soil and climate inputs."
)

st.info(
    "Reference defaults are dataset median values. "
    "Replace them with reliable farm-level measurements where available."
)


# --------------------------------------------------
# 5. CROP PREDICTION INPUT FORM
# --------------------------------------------------

with st.form("crop_prediction_form"):

    st.header("1. Growing season")

    season = st.selectbox(
        "Select season",
        seasons
    )

    # Start with dataset median values for all numerical features.
    input_data = medians.to_dict()
    input_data["season"] = season

    st.header("2. Essential farm inputs")

    col1, col2 = st.columns(2)

    quick_features = [
        "soil_soc_g_kg_0_5cm",
        "soil_clay_pct_0_30cm",
        "rainfall_mm",
        "temp_mean_c",
        "humidity_pct",
    ]

    # Essential inputs - first column.
    with col1:

        for feature in quick_features[:3]:

            minimum, maximum = get_input_bounds(feature)

            input_data[feature] = st.number_input(
                feature.replace("_", " ").title(),
                min_value=minimum,
                max_value=maximum,
                value=float(medians[feature]),
                step=0.1,
                format="%.3f"
            )

    # Essential inputs - second column.
    with col2:

        for feature in quick_features[3:]:

            minimum, maximum = get_input_bounds(feature)

            input_data[feature] = st.number_input(
                feature.replace("_", " ").title(),
                min_value=minimum,
                max_value=maximum,
                value=float(medians[feature]),
                step=0.1,
                format="%.3f"
            )

    st.caption(
        "Other model inputs use dataset median defaults. "
        "You can modify them in Advanced Settings."
    )

    # Advanced soil and climate inputs.
    with st.expander(
        "Advanced Settings — All soil and climate parameters"
    ):

        st.subheader("Soil parameters")

        soil_columns = st.columns(2)

        for index, feature in enumerate(SOIL_FEATURES):

            if feature in quick_features:
                continue

            minimum, maximum = get_input_bounds(feature)

            with soil_columns[index % 2]:

                input_data[feature] = st.number_input(
                    feature.replace("_", " ").title(),
                    min_value=minimum,
                    max_value=maximum,
                    value=float(medians[feature]),
                    step=0.1,
                    format="%.3f",
                    key=f"advanced_{feature}"
                )

        st.subheader("Climate parameters")

        climate_columns = st.columns(2)

        for index, feature in enumerate(CLIMATE_FEATURES):

            if feature in quick_features:
                continue

            minimum, maximum = get_input_bounds(feature)

            with climate_columns[index % 2]:

                input_data[feature] = st.number_input(
                    feature.replace("_", " ").title(),
                    min_value=minimum,
                    max_value=maximum,
                    value=float(medians[feature]),
                    step=0.1,
                    format="%.3f",
                    key=f"advanced_{feature}"
                )

    # Scenario simulator.
    st.header("3. Scenario Simulator")

    scenario_change = st.slider(
        "Change rainfall (%)",
        min_value=-50,
        max_value=50,
        value=0,
        step=5,
        help=(
            "Test how changing rainfall affects the model's "
            "historical crop predictions."
        )
    )

    submitted = st.form_submit_button(
        "Predict Historical Crop Patterns",
        width="stretch"
    )


# --------------------------------------------------
# 6. PREDICTION AND SCENARIO ANALYSIS
# --------------------------------------------------

if submitted:

    try:

        # Baseline prediction.
        results = predict_top_crops(
            model,
            input_data,
            top_n=3
        )

        # Create a modified input for rainfall scenario testing.
        scenario_input = input_data.copy()

        scenario_input["rainfall_mm"] = max(
            0.0,
            float(input_data["rainfall_mm"]) * (
                1 + scenario_change / 100
            )
        )

        # Predict crops using the modified rainfall.
        scenario_results = predict_top_crops(
            model,
            scenario_input,
            top_n=3
        )

        st.divider()

        # --------------------------------------------------
        # 6A. PREDICTION RESULTS
        # --------------------------------------------------

        st.header("4. Prediction results")

        result_df = pd.DataFrame(results)

        result_df.index = range(1, len(result_df) + 1)
        result_df.index.name = "Rank"

        result_df = result_df.rename(
            columns={
                "crop": "Predicted crop",
                "probability": "Historical pattern score (%)"
            }
        )

        st.dataframe(
            result_df,
            width="stretch"
        )

        chart_df = result_df.set_index(
            "Predicted crop"
        )

        st.bar_chart(
            chart_df["Historical pattern score (%)"]
        )

        # --------------------------------------------------
        # 6B. SCENARIO COMPARISON
        # --------------------------------------------------

        st.header("5. Scenario Comparison")

        baseline_df = pd.DataFrame(results)
        scenario_df = pd.DataFrame(scenario_results)

        comparison_df = pd.DataFrame({
            "Rank": [1, 2, 3],
            "Baseline crop": baseline_df["crop"],
            "Baseline score (%)": baseline_df["probability"],
            "Scenario crop": scenario_df["crop"],
            "Scenario score (%)": scenario_df["probability"]
        })

        new_rainfall = scenario_input["rainfall_mm"]

        st.write(
            f"Original rainfall: {input_data['rainfall_mm']:.2f} mm"
        )

        st.write(
            f"Modified rainfall: {new_rainfall:.2f} mm "
            f"({scenario_change:+d}%)"
        )

        st.dataframe(
            comparison_df,
            hide_index=True,
            width="stretch"
        )

        st.caption(
            "This comparison shows how the trained model responds "
            "to a modified rainfall input. It is not a validated "
            "agronomic forecast or crop suitability assessment."
        )

        st.warning(
            "These scores represent the model's learned historical "
            "crop patterns. They do not establish agronomic suitability, "
            "expected yield, profitability, or probability of crop success."
        )

        st.divider()

        # --------------------------------------------------
        # 6C. INDIGENOUS FARMING PRACTICES
        # --------------------------------------------------

        st.header("6. Indigenous Farming Practices")

        st.caption(
            "Practice matching currently uses crop association only. "
            "Geographic and farm-condition matching is not yet implemented."
        )

        predicted_crops = [
            result["crop"]
            for result in results
        ]

        matched_practices = get_practices_for_crops(
            predicted_crops
        )

        if matched_practices:

            st.info(
                "These practices are linked to the predicted crops in our "
                "knowledge base. They are not personalised recommendations. "
                "Check the region, conditions and limitations of each practice "
                "before considering its use."
            )

            for practice in matched_practices:

                with st.expander(
                    f"{practice['name']} — {practice['state']}"
                ):

                    st.write(
                        "**Region:**",
                        practice["region"]
                    )

                    st.write(
                        "**Practice type:**",
                        practice["practice_type"]
                    )

                    st.write(
                        "**Associated crops:**",
                        ", ".join(practice["associated_crops"])
                    )

                    st.write("**Description:**")
                    st.write(practice["description"])

                    st.write("**Purpose:**")

                    for purpose in practice["purpose"]:
                        st.write(f"- {purpose}")

                    st.write(
                        "**Conditions:**",
                        practice["conditions"]
                    )

                    st.write(
                        "**Limitations:**",
                        practice["limitations"]
                    )

                    st.caption(
                        f"Evidence: {practice['evidence_status']}"
                    )

                    st.markdown(
                        f"[View source]({practice['source']})"
                    )

        else:

            st.info(
                "No documented indigenous practices are currently "
                "linked to these predicted crops in our knowledge base."
            )

    except Exception as error:

        st.error(f"Prediction failed: {error}")


# --------------------------------------------------
# 7. MODEL EXPLAINABILITY
# --------------------------------------------------

st.divider()

st.header("7. Model Explainability")

feature_importance = pd.read_csv(
    "documentation/feature_importance.csv"
)

top_features = (
    feature_importance
    .sort_values(
        by="importance",
        ascending=False
    )
    .head(10)
    .copy()
)

top_features["feature"] = (
    top_features["feature"]
    .str.replace("numeric__", "", regex=False)
    .str.replace("categorical__", "", regex=False)
    .str.replace("_", " ")
    .str.title()
)

top_features = top_features.set_index("feature")

st.write(
    "The chart shows the 10 features with the highest "
    "Random Forest impurity-based importance scores."
)

st.bar_chart(
    top_features["importance"],
    horizontal=True
)

st.caption(
    "Feature importance indicates model reliance, not "
    "causation or independent agronomic significance."
)
