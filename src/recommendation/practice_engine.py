
import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]

KNOWLEDGE_BASE_PATH = (
    PROJECT_ROOT
    / "data"
    / "knowledge_base"
    / "practices.json"
)


def load_practices():
    """
    Load documented indigenous farming practices.
    """

    if not KNOWLEDGE_BASE_PATH.exists():
        raise FileNotFoundError(
            f"Knowledge base not found: {KNOWLEDGE_BASE_PATH}"
        )

    with open(
        KNOWLEDGE_BASE_PATH,
        "r",
        encoding="utf-8"
    ) as file:
        practices = json.load(file)

    return practices


def get_practices_for_crops(crop_names):
    """
    Find documented practices associated with predicted crops.
    """

    practices = load_practices()

    crop_names = {
        crop.strip().lower()
        for crop in crop_names
    }

    matched_practices = []

    for practice in practices:

        associated_crops = {
            crop.strip().lower()
            for crop in practice.get("associated_crops", [])
        }

        if crop_names.intersection(associated_crops):
            matched_practices.append(practice)

    return matched_practices
