from fastapi import APIRouter
import os
from pathlib import Path

router = APIRouter(tags=["debug"])

@router.get("/debug/paths")
def debug_paths() -> dict:
    cwd = os.getcwd()
    seg_path = os.getenv("SEGMENTATION_MODEL_PATH", "artefacts/models/segmentation.onnx")
    clf_path = os.getenv("CLASSIFICATION_MODEL_PATH", "artefacts/models/classification.onnx")
    
    return {
        "cwd": cwd,
        "seg_path": seg_path,
        "seg_exists": Path(seg_path).exists(),
        "clf_path": clf_path,
        "clf_exists": Path(clf_path).exists(),
        "artefacts_exists": Path("artefacts").exists(),
        "parent_artefacts_exists": Path("../artefacts").exists(),
        "files_in_cwd": os.listdir(cwd),
    }