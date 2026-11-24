# KrishiMitra AI

### An Intelligent Agricultural Decision Support System Integrating Machine Learning and Indigenous Farming Practices

KrishiMitra AI is a research prototype designed to explore how machine learning, agricultural data and documented indigenous farming practices can support agricultural decision-making in India.

The system analyses soil, climate and seasonal information to identify historical crop patterns, compare environmental scenarios and display relevant traditional farming practices.

## Key Features

- **Crop Intelligence Engine:** Uses a Random Forest classifier to predict the most likely historical crop patterns.
- **Crop Suitability and Resource Analysis:** Separates historical ML predictions from agronomic suitability assessment. This module is planned for further development.
- **Indigenous Farming Knowledge Base:** Displays documented traditional farming practices associated with predicted crops.
- **Model Explainability:** Displays the most influential model features using Random Forest feature importance.
- **Scenario Simulator:** Allows users to modify rainfall and compare changes in model predictions.
- **Interactive Dashboard:** Provides a Streamlit interface for entering agricultural data and viewing results.

## Technology Stack

- Python
- Pandas and NumPy
- Scikit-learn
- Streamlit
- Plotly
- Matplotlib
- Git and GitHub

## Machine Learning Model

The current implementation uses a Random Forest classifier with:

- 300 decision trees
- One-hot encoding for the season feature
- Class-weighted training
- District-grouped cross-validation

### Dataset

The project uses the India District Crop Dataset (1997–2015).

The primary modelling dataset excludes incomplete 2015 records and crop classes with fewer than 100 observations.

- Original records: 34,903
- Records used for modelling: 34,173
- Districts: 652
- States and Union Territories: 34
- Crop classes: 32
- Model features: 32

See `documentation/DATA_CARD.md` and `documentation/DATA_DICTIONARY.csv` for dataset details.

### Model Evaluation

Five-fold Stratified Group Cross-Validation was performed using district identifiers as groups.

| Metric | Mean Score |
|---|---:|
| Accuracy | 70.42% |
| Balanced Accuracy | 47.94% |
| Macro F1-score | 48.89% |
| Top-3 Accuracy | 90.39% |

These are results from the project's own district-grouped evaluation.

The difference between accuracy and macro F1 indicates that performance varies considerably across crop classes. Refer to `documentation/classification_report.csv` for class-level results.

## Project Structure

```text
KrishiMitra_AI/
├── app.py
├── requirements.txt
├── README.md
├── data/
│   ├── raw/
│   ├── processed/
│   └── knowledge_base/
│       └── practices.json
├── src/
│   ├── data/
│   ├── models/
│   ├── explainability/
│   ├── recommendation/
│   └── visualization/
├── models/
├── notebooks/
├── documentation/
└── tests/
```

## Installation and Execution

### 1. Clone the repository

```bash
git clone https://github.com/AyushDey10/KrishiMitra_AI.git
cd KrishiMitra_AI
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

### 3. Activate the environment

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the application

```bash
streamlit run app.py
```

The application will open in your browser, normally at:

`http://localhost:8501`

## Indigenous Farming Practices

The knowledge base currently includes:

1. Panikheti System — Northeast India
2. Apatani Rice-Fish Farming — Arunachal Pradesh
3. Bamboo Drip Irrigation — Meghalaya
4. Zabo Farming System — Nagaland

Each record includes its region, associated crops, description, purpose, conditions, limitations and source.

## Important Limitations

- The dataset covers 1997–2014 for the primary modelling analysis.
- Soil and climate data are district-level representations, not farm-level measurements.
- The model identifies historical crop patterns; it does not directly predict the best crop, expected yield, profitability or probability of crop success.
- Climate variables represent observed seasonal conditions, making the current model retrospective rather than a validated pre-season forecasting system.
- Model confidence scores represent classifier scores, not calibrated probabilities of agricultural success.
- Indigenous practice matching currently uses crop association only. Geographic and farm-condition matching is not yet implemented.
- The current prototype is a research and demonstration tool, not a substitute for local agricultural expertise or soil testing.

## Data Sources

- [India District Crop Dataset](https://github.com/priyanshupriyank04/india-district-crop-dataset)
- [Government of India — District-wise Crop Production Statistics](https://www.data.gov.in/catalog/district-wise-season-wise-crop-production-statistics-0)
- [ICAR — Indian Council of Agricultural Research](https://icar.org.in/)
- [ICAR Krishi Vigyan Kendra Portal](https://kvk.icar.gov.in/)

## Project Team

Developed as an academic team project for the RSBVP project showcase.

**Repository:** [AyushDey10/KrishiMitra_AI](https://github.com/AyushDey10/KrishiMitra_AI)

---

*KrishiMitra AI — Data-driven agricultural insights supported by traditional farming knowledge.*