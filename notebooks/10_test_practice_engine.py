
from src.recommendation.practice_engine import (
    load_practices,
    get_practices_for_crops
)


print("=" * 50)
print("KRISHIMITRA AI - INDIGENOUS PRACTICE ENGINE")
print("=" * 50)

practices = load_practices()

print("\nTotal documented practices:", len(practices))

# Test with Rice
predicted_crops = ["Rice", "Wheat", "Maize"]

matches = get_practices_for_crops(predicted_crops)

print("\nPredicted crops:", predicted_crops)
print("\nMATCHING FARMING PRACTICES")

for practice in matches:

    print("\nName:", practice["name"])
    print("Region:", practice["region"])
    print("State:", practice["state"])
    print("Purpose:", ", ".join(practice["purpose"]))

print("\nPractice engine test completed.")
