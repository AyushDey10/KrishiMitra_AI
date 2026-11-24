@'
# KrishiMitra AI — Model Evaluation

## 1. Model Overview

Algorithm: Random Forest Classifier

Number of trees: 300

Number of crop classes: 32

Input features: 32 (20 soil, 11 climate and 1 categorical season feature)

Validation method: 5-fold Stratified Group Cross-Validation

Grouping variable: District

Random state: 42

## 2. Cross-Validation Results

The model was evaluated using five district-grouped folds. Districts in each test fold were excluded from that fold's training data.

| Metric | Mean Score | Standard Deviation |
|---|---:|---:|
| Accuracy | 70.42% | 0.87% |
| Balanced Accuracy | 47.94% | 2.77% |
| Macro F1-score | 48.89% | 2.20% |
| Top-3 Accuracy | 90.39% | 0.74% |

## 3. Interpretation

- Accuracy measures the proportion of correctly classified records.
- Balanced accuracy gives equal importance to each crop class.
- Macro F1-score calculates the average F1-score across crop classes.
- Top-3 accuracy measures whether the actual crop appears among the three highest-ranked predictions.

The difference between accuracy and balanced accuracy indicates that model performance varies across crop classes.

The high Top-3 accuracy suggests that the actual crop frequently appears among the model's three leading predictions.

## 4. Class-wise Performance

The model performs relatively well on crops such as Rice, Wheat, Jute, Bajra and Sugarcane.

Performance is weaker for several less-represented or more difficult classes, including Small millets, Dry ginger, Tobacco and Onion.

Refer to classification_report.csv for detailed class-wise precision, recall and F1-scores.

## 5. Feature Importance

Feature importance was calculated using the Random Forest model's impurity-based importance scores.

Some of the highest-ranked features include:

- Solar radiation
- Minimum temperature
- Wind speed
- Mean temperature
- Soil organic carbon density
- Soil bulk density

These scores describe how the model uses features. They do not establish causation or prove agronomic importance.

Refer to feature_importance.csv for the complete ranking.

## 6. Dataset Limitations

- The dataset covers 1997–2014 for the primary analysis.
- The original dataset contains district-level information, not farm-level measurements.
- The model learns historical crop patterns rather than directly identifying the most suitable or profitable crop.
- Climate inputs represent observed seasonal conditions, so this is retrospective classification rather than a validated pre-season forecast.
- Performance differs across crop classes.
- Model scores are not probabilities of crop success, yield or profitability.

## 7. Conclusion

The Random Forest model provides a working historical crop-pattern classification system.

Its district-grouped evaluation gives a more realistic assessment of performance on unseen districts than a random record-level split.

The model can support exploratory agricultural analysis, but its predictions should not replace local agronomic expertise, soil testing or validated crop suitability assessments.
'@ | Set-Content -Path documentation/MODEL_EVALUATION.md -Encoding utf8