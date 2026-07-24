"""
Apply INT8 dynamic quantization to ONNX models and verify total size < 40 MB.
"""

import argparse
import os
from pathlib import Path

from onnxruntime.quantization import QuantType, quantize_dynamic


def quantize_model(fp32_path: Path, int8_path: Path) -> None:
    int8_path.parent.mkdir(parents=True, exist_ok=True)
    quantize_dynamic(
        model_input=fp32_path.as_posix(),
        model_output=int8_path.as_posix(),
        weight_type=QuantType.QInt8,
        optimize_model=True,
    )
    print(f"Quantized {fp32_path.name} -> {int8_path.name}")


def bytes_to_mb(num_bytes: int) -> float:
    return num_bytes / (1024 * 1024)


def main() -> None:
    parser = argparse.ArgumentParser(description="Quantize ONNX models to INT8")
    parser.add_argument(
        "--model-dir",
        type=Path,
        default=Path("artefacts/models"),
        help="Directory containing segmentation.onnx and classification.onnx",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("artefacts/models_int8"),
        help="Directory for quantized INT8 models",
    )
    parser.add_argument(
        "--max-total-mb",
        type=float,
        default=40.0,
        help="Maximum allowed combined size (MB) for quantized models",
    )
    args = parser.parse_args()

    seg_fp32 = args.model_dir / "segmentation.onnx"
    clf_fp32 = args.model_dir / "classification.onnx"

    seg_int8 = args.output_dir / "segmentation_int8.onnx"
    clf_int8 = args.output_dir / "classification_int8.onnx"

    for path in (seg_fp32, clf_fp32):
        if not path.exists():
            raise SystemExit(f"Missing ONNX model: {path}")

    quantize_model(seg_fp32, seg_int8)
    quantize_model(clf_fp32, clf_int8)

    seg_size = os.path.getsize(seg_int8)
    clf_size = os.path.getsize(clf_int8)
    total_mb = bytes_to_mb(seg_size + clf_size)

    print(
        f"INT8 sizes — segmentation: {bytes_to_mb(seg_size):.2f} MB, "
        f"classification: {bytes_to_mb(clf_size):.2f} MB, "
        f"total: {total_mb:.2f} MB"
    )

    if total_mb > args.max_total_mb:
        raise SystemExit(
            f"Total quantized model size {total_mb:.2f} MB exceeds "
            f"limit of {args.max_total_mb:.2f} MB"
        )


if __name__ == "__main__":
    main()

