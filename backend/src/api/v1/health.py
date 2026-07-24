from fastapi import APIRouter

from services.inference_service import get_inference_service


router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    """
    Lightweight health check endpoint.

    Returns whether the inference models are loaded and ready.
    """
    service = get_inference_service()
    return {
        "status": "ok",
        "models_loaded": service.models_loaded,
    }

