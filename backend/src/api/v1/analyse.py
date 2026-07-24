from fastapi import APIRouter, File, HTTPException, UploadFile, status
from services.inference_service import InferenceError, get_inference_service
import traceback

router = APIRouter(tags=["analysis"])

@router.post("/analyse")
async def analyse_image(
    file: UploadFile = File(..., description="Dermoscopic image file"),
) -> dict:
    service = get_inference_service()
    try:
        result = await service.run_inference(file)
    except InferenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        full_error = traceback.format_exc()
        print("=" * 60)
        print("FULL TRACEBACK:")
        print(full_error)
        print("=" * 60)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=full_error,
        ) from exc

    return result