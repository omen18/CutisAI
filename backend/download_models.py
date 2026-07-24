import os
import sys
from pathlib import Path


def download_models() -> None:
    hf_repo_id = os.getenv("HF_REPO_ID")
    hf_token   = os.getenv("HF_TOKEN")

    if not hf_repo_id:
        print("[download_models] HF_REPO_ID not set — skipping download.")
        return

    # Use absolute persistent path on Render
    models_dir = Path("/opt/render/project/src/backend/artefacts/models")
    models_dir.mkdir(parents=True, exist_ok=True)

    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        print("[download_models] huggingface_hub not installed — cannot download models.")
        sys.exit(1)

    files_to_download = [
        "segmentation.onnx",
        "segmentation.onnx.data",
        "classification.onnx",
        "classifier.onnx.data",
    ]

    print(f"[download_models] Downloading from {hf_repo_id} ...")

    for filename in files_to_download:
        dest = models_dir / filename
        if dest.exists():
            print(f"[download_models] {filename} already exists — skipping.")
            continue
        hf_hub_download(
            repo_id=hf_repo_id,
            filename=filename,
            local_dir=str(models_dir),
            token=hf_token,
        )
        print(f"[download_models] {filename} downloaded.")

    print("[download_models] Done.")


if __name__ == "__main__":
    download_models()