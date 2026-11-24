from sklearn.model_selection import StratifiedGroupKFold


def create_grouped_splits(
    X,
    y,
    metadata,
    n_splits=5,
    random_state=42
):
    """
    Create stratified cross-validation splits
    while keeping districts separate.
    """

    if not (
        len(X) == len(y) == len(metadata)
    ):
        raise ValueError(
            "X, y and metadata must have equal lengths."
        )

    if metadata["district_key"].isnull().any():
        raise ValueError(
            "District groups contain missing values."
        )

    splitter = StratifiedGroupKFold(
        n_splits=n_splits,
        shuffle=True,
        random_state=random_state
    )

    splits = list(
        splitter.split(
            X,
            y,
            groups=metadata["district_key"]
        )
    )

    return splits