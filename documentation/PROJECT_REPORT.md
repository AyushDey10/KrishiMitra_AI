
# KRISHIMITRA AI

## An Intelligent Agricultural Decision Support System Integrating Machine Learning and Indigenous Farming Practices

**Project Report**

**Submitted by:**  


**SCHOOL:** PM SHRI KENDRIYA VIDYALAYA BARRACKPORE (A.F.S)

**Academic Year:** 2026-2027

---

# Abstract

Agriculture plays an important role in India's economy and food security. Crop selection depends on several factors, including soil properties, climatic conditions and growing seasons. Analysing these factors can help us understand historical agricultural patterns and support agricultural research.

KrishiMitra AI is a machine-learning-based agricultural decision support prototype that analyses soil and climate parameters to identify historical crop patterns. It uses a Random Forest classification model trained on district-level agricultural data from India. The system also includes a rainfall scenario simulator, a model explainability dashboard and a knowledge base containing documented indigenous farming practices.

The dataset contains 34,173 records, 32 input features and 32 crop classes after preprocessing and filtering. The Random Forest model was evaluated using five-fold Stratified Group Cross-Validation, with districts kept separate between training and testing folds. The model achieved a mean accuracy of 70.42%, macro F1-score of 48.89% and top-3 accuracy of 90.39%.

A Streamlit-based web application allows users to enter soil and climate parameters, view the model's top-three crop predictions, explore rainfall scenarios and examine relevant traditional farming practices.

The current system focuses on historical crop-pattern classification rather than predicting the most suitable or profitable crop. It is designed as an educational and research prototype that demonstrates the application of machine learning and documented agricultural knowledge in a single platform.

**Keywords:** Machine Learning, Agriculture, Random Forest, Crop Classification, Soil Analysis, Climate Data, Indigenous Farming Practices, Explainable AI.

---

# 1. Introduction

Agriculture is one of the major sectors of India and plays an important role in providing food, employment and raw materials. Agricultural productivity and crop selection are influenced by various environmental factors, including soil characteristics, rainfall, temperature, humidity and seasonal conditions.

Farmers often need to consider several environmental factors when deciding which crops to cultivate. Understanding the relationship between these factors and historical crop patterns can support agricultural research and decision-making.

Machine learning provides methods to analyse large datasets and identify patterns that may not be easily visible through manual analysis. Classification algorithms can learn relationships between input features and historical crop labels and use these learned patterns to classify new input records.

KrishiMitra AI applies this approach to Indian district-level agricultural data. It uses soil and climate parameters along with the growing season as inputs to a Random Forest classification model. The application displays the three highest-ranked crop predictions and allows users to explore how changing rainfall affects the model's output.

The project also includes an indigenous farming practices knowledge base. It contains documented traditional agricultural practices, along with their associated crops, regions, purposes, conditions, limitations and supporting sources.

The system combines machine learning, interactive data analysis and traditional agricultural knowledge in a single web application. It is intended to demonstrate how these technologies can be integrated into an agricultural decision support prototype.


---

# 2. Problem Statement

Crop selection is influenced by several interconnected factors, including soil properties, rainfall, temperature, humidity and growing seasons. Analysing these factors across large agricultural datasets can be difficult without suitable computational tools.

Historical agricultural records contain useful information about the relationship between environmental conditions and crops cultivated in different regions. However, this information is not always easy to explore through a simple interface.

There is also a need to preserve and present documented indigenous farming practices alongside modern agricultural data analysis.

The project addresses the following problems:

1. Difficulty in analysing relationships between soil, climate and historical crop patterns.
2. Limited accessibility of machine-learning-based crop classification through a simple interactive application.
3. Difficulty in exploring how changes in rainfall affect model predictions.
4. Lack of integration between historical crop-pattern analysis and documented indigenous farming practices in the prototype.

KrishiMitra AI addresses these problems through a machine-learning-based classification system and an interactive web application.

# 3. Project Objectives

The main objectives of KrishiMitra AI are:

1. To develop a machine-learning model that identifies historical crop patterns using soil, climate and seasonal features.
2. To preprocess and analyse district-level agricultural data from India.
3. To implement a Random Forest classification model for multi-class crop prediction.
4. To evaluate the model using district-grouped cross-validation.
5. To develop an interactive Streamlit dashboard for entering agricultural parameters and viewing predictions.
6. To implement a scenario simulator that examines changes in model predictions when rainfall is modified.
7. To develop a knowledge base of documented indigenous farming practices.
8. To provide model explainability through feature-importance analysis.
9. To communicate the limitations and uncertainty of machine-learning predictions clearly.

# 4. Proposed System

KrishiMitra AI is designed as an integrated agricultural data-analysis prototype.

The system accepts soil properties, climate measurements and the growing season as inputs. These values are passed to a trained Random Forest classification model, which produces the three highest-ranked historical crop predictions.

The application also provides supporting functionality through the following modules.

## 4.1 Crop Intelligence Engine

This module uses a trained Random Forest classifier to analyse numerical soil and climate features along with the categorical growing season.

It generates the top-three predicted crop classes and their corresponding model scores.

These scores represent the model's learned historical classification patterns and should not be interpreted as probabilities of crop success or agronomic suitability.

## 4.2 Scenario Simulator

The scenario simulator allows users to modify rainfall by a selected percentage between -50% and +50%.

The modified rainfall value is passed through the same trained model. The application compares the baseline predictions with the modified-scenario predictions.

This module demonstrates model sensitivity to rainfall changes. It is not a validated climate forecast or agricultural impact simulation.

## 4.3 Indigenous Farming Practices Knowledge Base

This module stores documented indigenous farming practices in a structured JSON file.

Each record includes information such as:

- Practice name and region
- Associated crops
- Description and purpose
- Conditions required
- Limitations
- Evidence status and source

The application matches practices to the crops appearing in the top-three predictions.

The current implementation matches by crop association only. It does not perform geographic or farm-condition-based personalisation.

## 4.4 Explainable AI Module

The explainability module displays the ten highest-ranked features according to the Random Forest model's impurity-based feature-importance scores.

This helps users understand which input features the model relies on most when learning historical crop patterns.

Feature importance does not establish causation or independent agronomic significance.

## 4.5 Crop Suitability and Resource Analysis

A separate agronomic suitability and resource-analysis engine is planned for future development.

It is intended to assess crop-specific environmental requirements using credible agricultural sources and validated rules.

This module is not part of the current implemented prototype.


---

# 5. System Architecture

KrishiMitra AI follows a modular architecture in which data preprocessing, machine learning, prediction, knowledge retrieval and visualisation are handled by separate components.

## 5.1 Architecture Workflow

The overall workflow is:

1. **User Input:** The user enters soil properties, climate measurements and the growing season through the Streamlit interface.
2. **Input Validation:** Numerical inputs are restricted using observed dataset ranges, with additional non-negative rainfall and percentage constraints.
3. **Data Preparation:** Input values are organised into the feature structure expected by the trained model.
4. **Machine Learning Model:** The Random Forest classifier processes the input and generates crop-class scores.
5. **Prediction Output:** The application displays the three highest-ranked crop classes.
6. **Scenario Analysis:** Modified rainfall values are evaluated using the same model.
7. **Knowledge Retrieval:** Predicted crops are matched with records in the indigenous farming practices knowledge base.
8. **Explainability:** Feature-importance information is displayed to help users understand model behaviour.

## 5.2 Software Architecture Components

| Component | Technology / File |
|---|---|
| User interface | Streamlit (`app.py`) |
| Data handling | Pandas |
| Data preprocessing | `src/data/preprocessing.py` |
| Input validation | `app.py` |
| Classification model | Scikit-learn Random Forest |
| Model prediction | `src/models/predict.py` |
| Model evaluation | `src/models/evaluate.py` |
| Validation strategy | `src/data/validation.py` |
| Farming practices | JSON knowledge base |
| Practice retrieval | `src/recommendation/practice_engine.py` |
| Explainability | Random Forest feature importance |
| Version control | Git and GitHub |

## 5.3 Data Flow

The application follows this data flow:

**User Inputs → Input Validation → Feature Preparation → Random Forest Model → Top-Three Predictions → Scenario Comparison and Practice Matching → Dashboard Visualisation**

The trained model is loaded from a saved Joblib artifact rather than retrained every time the application starts.

# 6. Dataset Description

The project uses the India District Crop Dataset, which combines historical crop-production information with soil and climate features.

The dataset is used to identify relationships between environmental conditions and historically recorded dominant crops.

## 6.1 Dataset Overview

| Parameter | Description |
|---|---|
| Geographic coverage | India |
| Original records | 34,903 |
| Original features | 48 columns |
| District coverage | 652 districts |
| State and UT coverage | 34 |
| Original year range | 1997–2015 |
| Primary analysis period | 1997–2014 |
| Original crop classes | 63 |
| Retained crop classes | 32 |
| Final processed records | 34,173 |
| Final model features | 32 |

## 6.2 Feature Categories

The final model uses 32 features divided into three categories:

1. **Soil features:** 20 numerical parameters describing soil characteristics.
2. **Climate features:** 11 numerical parameters describing rainfall, temperature, humidity, solar radiation, wind and other climate conditions.
3. **Season feature:** One categorical variable representing the growing season.

The target variable is `dominant_crop`, which represents the historically dominant crop associated with each dataset record.

## 6.3 Dataset Sources

The dataset combines information from the following sources:

- Directorate of Economics and Statistics (DES), Government of India, for agricultural crop-production records.
- SoilGrids 2.0 for soil property information.
- NASA POWER for climate information.

The dataset's accompanying documentation and data dictionary are maintained in the project's `documentation` directory.

## 6.4 Dataset Limitations

The dataset has several limitations:

- The primary analysis uses historical records from 1997–2014.
- District-level measurements may not represent conditions on an individual farm.
- Soil measurements are not equivalent to current farm-level soil tests.
- The dataset does not contain phosphorus and potassium soil measurements.
- Some district boundaries and identifiers may differ across historical and geographical data sources.
- Climate variables represent observed seasonal conditions rather than future weather forecasts.

Therefore, the dataset supports retrospective historical-pattern analysis rather than a fully validated pre-season crop recommendation system.


---

# 7. Data Preprocessing

Data preprocessing was performed to prepare the original agricultural dataset for machine-learning training and evaluation.

## 7.1 Year Filtering

The original dataset covers 1997–2015. The year 2015 was excluded from the primary analysis because it contains only 97 records across 34 districts and two states, making it substantially incomplete compared with previous years.

The primary analysis therefore uses records from 1997–2014.

## 7.2 Rare Crop Filtering

The original dataset contains 63 crop classes.

To reduce the effect of extremely rare classes, only crops with at least 100 records were retained.

This resulted in 32 crop classes and 34,173 records, retaining approximately 98.18% of the records from the 1997–2014 period.

## 7.3 Feature Selection

The final model uses 32 input features:

- 20 soil features
- 11 climate features
- 1 categorical season feature

Location identifiers such as state, district and geographical coordinates were excluded from model training to reduce location memorisation and improve evaluation on unseen districts.

Target-derived fields, including dominant yield and crop-share information, were also excluded to avoid target leakage.

## 7.4 Missing Values and Data Preparation

The preprocessing module checks the required columns, applies year and crop-frequency filters, separates the input features from the target variable and retains district metadata for grouped validation.


The preprocessing module checks the required columns, applies year and crop-frequency filters, separates the input features from the target variable and retains district metadata for grouped validation.

The current preprocessing module does not perform a separate missing-value imputation step. Numerical features are passed through the model pipeline without scaling or imputation. Therefore, missing values in the input data remain a limitation that should be considered when interpreting model predictions.

The season feature is retained as a categorical variable and encoded during model training.


The season feature is retained as a categorical variable and encoded during model training.

## 7.5 Final Dataset

After preprocessing, the resulting dataset contains:

- 34,173 records
- 32 input features
- 32 target crop classes
- 652 district groups

# 8. Machine Learning Methodology

## 8.1 Random Forest Classifier

KrishiMitra AI uses the Random Forest classification algorithm.

Random Forest is an ensemble learning method that combines predictions from multiple decision trees. Each tree is trained using sampled training data and considers a subset of features when selecting splits.

For classification, the individual tree outputs are combined to produce class scores.

Random Forest was selected because it can model nonlinear relationships, handle mixed feature types through preprocessing and support multi-class classification.

## 8.2 Model Configuration

The implemented model uses the following configuration:

| Parameter | Value |
|---|---|
| Algorithm | Random Forest Classifier |
| Number of estimators | 300 |
| Maximum features | sqrt |
| Minimum samples per leaf | 2 |
| Class weighting | balanced_subsample |
| Random state | 42 |
| Parallel processing | All available CPU cores |

## 8.3 Categorical Feature Encoding

The growing season is a categorical input.

A OneHotEncoder is used to convert the season categories into numerical indicator features. Unknown categories are ignored during transformation to make the preprocessing pipeline more robust.

The numerical soil and climate features are passed through without additional scaling.

## 8.4 Training Pipeline

The model is implemented as a Scikit-learn Pipeline.

The pipeline combines:

1. Numerical and categorical feature preprocessing.
2. One-hot encoding of the season feature.
3. Random Forest classification.

This ensures that the same preprocessing operations are applied during training and prediction.

## 8.5 District-Grouped Cross-Validation

A five-fold Stratified Group Cross-Validation strategy was used to evaluate model performance.

The grouping variable is `district_key`.

All records belonging to a district are assigned to either the training or testing portion of a fold, preventing the same district from appearing in both.

Stratification helps maintain representation of the crop classes across folds.

This evaluation strategy provides a more realistic estimate of how the model performs on districts excluded from its training data than ordinary random record-level splitting.

## 8.6 Evaluation Metrics

The model was evaluated using four metrics:

**Accuracy:** Measures the proportion of correctly classified records.

**Balanced Accuracy:** Calculates the average recall across classes, giving each crop class equal weight.

**Macro F1-score:** Calculates the F1-score independently for each crop class and takes their unweighted average.

**Top-3 Accuracy:** Measures whether the actual crop class appears among the three highest-scoring predictions.

Using multiple metrics provides a more complete view of model performance, especially when crop classes have different record counts.


---

# 9. Model Evaluation and Results

The Random Forest classifier was evaluated using five-fold Stratified Group Cross-Validation, with districts used as grouping units.

Each fold was evaluated independently, and the reported results represent the mean and standard deviation across the five folds.

## 9.1 Cross-Validation Results

| Evaluation Metric | Mean | Standard Deviation |
|---|---:|---:|
| Accuracy | 70.42% | 0.87% |
| Balanced Accuracy | 47.94% | 2.77% |
| Macro F1-score | 48.89% | 2.20% |
| Top-3 Accuracy | 90.39% | 0.74% |

## 9.2 Results Interpretation

The model achieved a mean accuracy of 70.42%, indicating that approximately seven out of ten test records were assigned the correct top-ranked crop.

The balanced accuracy of 47.94% and macro F1-score of 48.89% indicate that performance varies across crop classes.

The top-3 accuracy of 90.39% indicates that the actual crop class appeared among the model's three highest-ranked predictions in approximately nine out of ten test records.

These results show that the model is more effective for some crop classes than others. Therefore, overall accuracy alone is not sufficient to describe its performance.

## 9.3 Class-wise Performance

The model achieved relatively strong results for several frequently represented crops, including:

- Wheat
- Rice
- Jute
- Bajra
- Sugarcane
- Groundnut
- Soyabean

Performance was weaker for some other classes, including:

- Small millets
- Dry ginger
- Tobacco
- Onion
- Banana
- Garlic

The detailed precision, recall and F1-score values are available in `classification_report.csv`.

## 9.4 Feature Importance

The Random Forest model provides impurity-based feature-importance scores.

The highest-ranked features include:

1. Solar radiation
2. Minimum temperature
3. Wind speed
4. Mean temperature
5. Soil organic carbon density
6. Soil bulk density
7. Soil organic carbon content
8. Humidity
9. Rainfall

Feature importance describes how the trained model uses input variables. It does not establish that a feature independently causes a particular crop to be cultivated.

## 9.5 Evaluation Artifacts

The following evaluation files are maintained in the project's documentation directory:

| File | Purpose |
|---|---|
| `random_forest_cv_results.csv` | Fold-wise model metrics |
| `classification_report.csv` | Class-wise classification performance |
| `confusion_matrix.csv` | Actual versus predicted crop classes |
| `feature_importance.csv` | Model feature-importance scores |
| `MODEL_EVALUATION.md` | Written evaluation summary |

# 10. Streamlit Application Implementation

A Streamlit-based web application was developed to make the trained machine-learning model accessible through an interactive dashboard.

The application is implemented in `app.py`.

## 10.1 Dashboard Interface

The dashboard provides a growing-season selector and numerical input fields for soil and climate parameters.

It contains five essential farm inputs:

- Soil organic carbon
- Soil clay percentage
- Rainfall
- Mean temperature
- Humidity

Additional numerical parameters can be modified through the Advanced Settings section.

## 10.2 Input Validation

The application uses minimum and maximum values calculated from the processed training dataset.

Additional checks ensure that rainfall is not negative and percentage-based inputs remain between 0 and 100.

Dataset median values are used as initial defaults.

These limits are input-validation constraints, not universal agronomic safety thresholds.

## 10.3 Crop Prediction Results

When the user submits the form, the application passes the selected season and numerical features to the trained Random Forest pipeline.

The dashboard displays:

- The three highest-ranked crop predictions
- Their corresponding model scores
- A bar chart comparing the scores

The results are presented as historical crop-pattern scores rather than crop success probabilities.

## 10.4 Rainfall Scenario Simulator

The application includes a rainfall adjustment slider ranging from -50% to +50%.

The simulator creates a modified copy of the user's input and changes the rainfall value according to the selected percentage.

The same trained model processes both the baseline and modified inputs.

The dashboard then displays a comparison of the two prediction results.

This functionality demonstrates model sensitivity to rainfall changes and is not a validated agricultural forecast.

## 10.5 Indigenous Farming Practices Display

The application retrieves practices associated with the predicted crops from the JSON knowledge base.

Each practice can be expanded to display its name, region, associated crops, description, purpose, conditions, limitations, evidence status and source link.

The current implementation uses crop association for matching and does not provide personalised geographic recommendations.

## 10.6 Model Explainability Dashboard

The application displays a horizontal bar chart showing the ten most important model features.

The chart is based on impurity-based Random Forest feature importance.

This provides an overview of which variables the model relies on when classifying historical crop patterns.


---

# 11. Limitations

Although KrishiMitra AI demonstrates the integration of machine learning and indigenous farming knowledge, the current prototype has several limitations.

## 11.1 Dataset Limitations

The dataset covers the period 1997–2014 for the primary analysis. Agricultural patterns and climatic conditions may have changed since then.

The dataset contains district-level information, which cannot fully represent variations between individual farms within a district.

## 11.2 Model Limitations

The model predicts historical dominant crop patterns. It does not directly determine the most profitable, productive or agronomically suitable crop for a particular farm.

The difference between accuracy and balanced accuracy indicates that the model performs unevenly across crop classes.

## 11.3 Climate Data Limitations

The climate variables represent observed seasonal weather corresponding to historical crop records.

Consequently, the current model performs retrospective classification rather than genuine pre-season crop forecasting.

## 11.4 Indigenous Knowledge Limitations

The current knowledge base contains a limited number of documented indigenous farming practices.

The practice-matching system uses crop associations and does not yet perform detailed geographic, climatic or soil-based suitability assessment.

## 11.5 Agronomic Suitability Limitations

A dedicated crop suitability and resource analysis engine has not yet been implemented.

The current prototype therefore does not provide validated recommendations for fertiliser quantities, irrigation schedules, pesticide application or expected crop yield.

# 12. Future Scope

The following improvements can be considered in future versions:

1. **Updated Agricultural Dataset:** Incorporate more recent crop production, soil and climate information.
2. **Crop Suitability Engine:** Develop a separate rule-based agronomic assessment module using validated agricultural references.
3. **Weather Forecast Integration:** Integrate reliable weather forecast data for forward-looking scenario analysis.
4. **Expanded Knowledge Base:** Add more indigenous farming practices with verified sources and regional applicability.
5. **Advanced Explainability:** Integrate SHAP analysis to provide more detailed explanations of individual predictions.
6. **Geographical Analysis:** Introduce district-level maps and regional agricultural comparisons.
7. **Multilingual Interface:** Support Indian languages to improve accessibility for farmers.
8. **Farm-Level Inputs:** Allow users to enter laboratory-tested soil values instead of relying on district-level reference data.
9. **Improved Model Performance:** Explore additional algorithms, class-specific improvements and more robust validation strategies.
10. **Mobile Accessibility:** Develop a mobile-friendly interface for easier access in rural areas.

# 13. Conclusion

KrishiMitra AI demonstrates a prototype agricultural decision support system that combines machine learning, interactive data analysis and documented indigenous farming practices.

The system uses a Random Forest classifier trained on historical district-level agricultural data to identify crop patterns from soil, climate and seasonal inputs.

The five-fold district-grouped evaluation achieved a mean accuracy of 70.42%, balanced accuracy of 47.94%, macro F1-score of 48.89% and top-3 accuracy of 90.39%.

The Streamlit dashboard allows users to explore crop predictions, compare rainfall scenarios, examine model feature importance and access information about associated indigenous farming practices.

The project also highlights the importance of distinguishing historical crop-pattern prediction from scientifically validated crop suitability recommendations.

Overall, KrishiMitra AI provides a functional research prototype and a foundation for developing a more comprehensive, evidence-based agricultural decision support system.

# 14. References

1. Priyanshu Priyank. India District Crop Dataset (1997–2015). GitHub repository.  
   https://github.com/priyanshupriyank04/india-district-crop-dataset

2. Government of India, Ministry of Agriculture and Farmers Welfare. District-wise, Season-wise Crop Production Statistics.  
   https://www.data.gov.in/catalog/district-wise-season-wise-crop-production-statistics-0

3. Directorate of Economics and Statistics, Department of Agriculture and Farmers Welfare. Crop Area, Production and Yield Reports.  
   https://data.desagri.gov.in/website/crops-apy-report-web

4. Indian Council of Agricultural Research (ICAR).  
   https://icar.org.in/

5. Krishi Vigyan Kendra (KVK) Portal, ICAR.  
   https://kvk.icar.gov.in/

6. Scikit-learn Documentation. Random Forest Classifier.  
   https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html

7. Scikit-learn Documentation. Stratified Group K-Fold.  
   https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedGroupKFold.html

8. Streamlit Documentation.  
   https://docs.streamlit.io/

9. NASA Prediction Of Worldwide Energy Resources (POWER).  
   https://power.larc.nasa.gov/

10. ISRIC World Soil Information. SoilGrids.  
    https://soilgrids.org/
