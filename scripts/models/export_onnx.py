"""
Export trained CutisAI PyTorch models to ONNX.

Segmentation: ResUNet (binary mask)
Classification: EfficientNet-B0 (benign vs malignant)
"""

import argparse
from pathlib import Path

import torch

from training.models import EfficientNetB0Classifier, ResUNet


def export_resunet(ckpt_path: Path, onnx_path: Path) -> None:
    device = torch.device("cpu")
    model = ResUNet(pretrained=False)

    state = torch.load(ckpt_path, map_location=device)
    model.load_state_dict(state["model_state"])
    model.to(device)
    model.eval()

    dummy_input = torch.randn(1, 3, 256, 256, device=device)

    onnx_path.parent.mkdir(parents=True, exist_ok=True)
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path.as_posix(),
        input_names=["input"],
        output_names=["mask_logits"],
        opset_version=17,
        do_constant_folding=True,
        dynamic_axes={"input": {0: "batch"}, "mask_logits": {0: "batch"}},
    )
    print(f"Exported ResUNet ONNX to {onnx_path}")


def export_efficientnet(ckpt_path: Path, onnx_path: Path) -> None:
    device = torch.device("cpu")
    model = EfficientNetB0Classifier(pretrained=False)

    state = torch.load(ckpt_path, map_location=device)
    model.load_state_dict(state["model_state"])
    model.to(device)
    model.eval()

    dummy_input = torch.randn(1, 3, 256, 256, device=device)

    onnx_path.parent.mkdir(parents=True, exist_ok=True)
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path.as_posix(),
        input_names=["input"],
        output_names=["logits"],
        opset_version=17,
        do_constant_folding=True,
        dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}},
    )
    print(f"Exported EfficientNet-B0 ONNX to {onnx_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Export CutisAI models to ONNX")
    parser.add_argument(
        "--seg-ckpt",
        type=Path,
        required=True,
        help="Path to ResUNet checkpoint (resunet_best.pth)",
    )
    parser.add_argument(
        "--clf-ckpt",
        type=Path,
        required=True,
        help="Path to EfficientNet-B0 checkpoint (efficientnet_b0_best.pth)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("artefacts/models"),
        help="Directory to write ONNX models",
    )
    args = parser.parse_args()

    seg_onnx = args.output_dir / "segmentation.onnx"
    clf_onnx = args.output_dir / "classification.onnx"

    export_resunet(args.seg_ckpt, seg_onnx)
    export_efficientnet(args.clf_ckpt, clf_onnx)


if __name__ == "__main__":
    main()

