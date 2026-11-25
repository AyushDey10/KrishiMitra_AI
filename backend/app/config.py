from __future__ import annotations

import os
from pathlib import Path

# backend/app/config.py -> project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _csv(name: str, default: str) -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


class Settings:
    """Environment-driven configuration. No secrets live in the repository."""

    allowed_origins: list[str] = _csv(
        "KRISHIMITRA_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )

    # Optional overrides. When unset, the paths baked into src/ are used
    # unchanged, which keeps the Streamlit application and the API in sync.
    model_path: Path | None = (
        Path(os.environ["KRISHIMITRA_MODEL_PATH"])
        if os.getenv("KRISHIMITRA_MODEL_PATH")
        else None
    )
    data_path: Path | None = (
        Path(os.environ["KRISHIMITRA_DATA_PATH"])
        if os.getenv("KRISHIMITRA_DATA_PATH")
        else None
    )

    # Optional compact model artifacts for memory-constrained API deployment.
    compact_arrays_path: Path | None = (
        Path(os.environ["KRISHIMITRA_COMPACT_ARRAYS_PATH"])
        if os.getenv("KRISHIMITRA_COMPACT_ARRAYS_PATH")
        else None
    )
    compact_preprocessor_path: Path | None = (
        Path(os.environ["KRISHIMITRA_COMPACT_PREPROCESSOR_PATH"])
        if os.getenv("KRISHIMITRA_COMPACT_PREPROCESSOR_PATH")
        else None
    )

    # Number of crops returned when the client does not ask for a specific count.
    default_top_n: int = int(os.getenv("KRISHIMITRA_TOP_N", "3"))


settings = Settings()
