from io import BytesIO
from typing import Tuple

import numpy as np
from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from utils.errors import InferenceError


IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


async def decode_and_validate_image(file: UploadFile) -> Image.Image:
    """
    Decode an uploaded image and perform basic validation.
    """
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise InferenceError("Invalid or corrupted image file.") from exc

    min_dim = min(image.width, image.height)
    if min_dim < 128:
        raise InferenceError("Image dimensions must be at least 128x128 pixels.")

    return image


def resize_image(image: Image.Image, size: Tuple[int, int]) -> Image.Image:
    return image.resize(size, Image.Resampling.BILINEAR)


def normalize_imagenet(image: Image.Image) -> np.ndarray:
    """
    Convert a PIL image to a normalised NCHW float32 tensor for ONNX.
    """
    arr = np.asarray(image).astype(np.float32) / 255.0  # HWC, 0-1
    arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
    # HWC -> CHW
    chw = np.transpose(arr, (2, 0, 1))
    # Add batch dimension: (1, C, H, W)
    return np.expand_dims(chw, axis=0)


