
from src.data.preprocessing import load_dataset, prepare_dataset
from src.models.predict import load_model, predict_top_crops


# Load one real dataset example
df = load_dataset()
X, y, metadata = prepare_dataset(df)

sample = X.iloc[0].to_dict()

# Load trained model
model = load_model()

# Generate top 3 predictions
results = predict_top_crops(
    model,
    sample,
    top_n=3
)

print("=" * 50)
print("KRISHIMITRA AI - PREDICTION TEST")
print("=" * 50)

print("\nInput season:", sample["season"])
print("Actual historical crop:", y.iloc[0])

print("\nTOP 3 PREDICTED CROPS")

for rank, result in enumerate(results, start=1):
    print(
        f"{rank}. {result['crop']} "
        f"- {result['probability']}%"
    )

print("\nPrediction test completed.")
