from typing import Literal

Label = Literal["benign", "malignant"]


def generate_recommendation(label: Label, confidence: float) -> str:
    """
    Rule-based recommendation logic aligned with PRD.

    Confidence is expected as a percentage (0–100).
    """
    if label == "malignant":
        if confidence > 85:
            return (
                "High suspicion of malignancy. Urgent referral to a dermatologist "
                "is recommended. Dermoscopic biopsy should be considered."
            )
        if 60 <= confidence <= 85:
            return (
                "Moderate suspicion of malignancy. Schedule a dermatologist review "
                "within 2 weeks and monitor the lesion for changes."
            )
        return (
            "Low-confidence malignant prediction. Repeat imaging is recommended "
            "and a clinical review should be arranged."
        )

    # Benign
    if confidence > 80:
        return (
            "Low-risk lesion prediction (benign). Routine annual skin checks are "
            "recommended."
        )
    return (
        "Uncertain benign prediction. A follow-up clinical examination within "
        "3 months is recommended."
    )

