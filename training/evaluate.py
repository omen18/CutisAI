import argparse
from pathlib import Path

import torch
from torch.utils.data import DataLoader
from tqdm import tqdm

from datasets import ISICSegmentationDataset, ISICClassificationDataset
from models import ResUNet, EfficientNetB0Classifier


@torch.no_grad()
def evaluate_segmentation(
    model_path: Path,
    data_root: Path,
    split_csv: Path,
    batch_size: int = 8,
) -> None:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    ds = ISICSegmentationDataset(root=data_root, split_csv=split_csv, transform=None)
    loader = DataLoader(ds, batch_size=batch_size, shuffle=False, num_workers=4)

    model = ResUNet(pretrained=False).to(device)
    state = torch.load(model_path, map_location=device)
    model.load_state_dict(state["model_state"])
    model.eval()

    total_dice = 0.0
    total_iou = 0.0
    n_samples = 0

    for images, masks in tqdm(loader, desc="Eval Segmentation"):
        images = images.to(device)
        masks = masks.to(device)

        logits = model(images)
        probs = torch.sigmoid(logits)
        preds = (probs > 0.5).float()

        intersection = (preds * masks).sum(dim=(1, 2, 3))
        union = preds.sum(dim=(1, 2, 3)) + masks.sum(dim=(1, 2, 3))
        dice = (2 * intersection + 1.0) / (union + 1.0)

        iou = (intersection + 1.0) / (
            preds.sum(dim=(1, 2, 3)) + masks.sum(dim=(1, 2, 3)) - intersection + 1.0
        )

        total_dice += dice.sum().item()
        total_iou += iou.sum().item()
        n_samples += images.size(0)

    print(f"Segmentation Dice: {total_dice / n_samples:.4f}")
    print(f"Segmentation IoU:  {total_iou / n_samples:.4f}")


@torch.no_grad()
def evaluate_classifier(
    model_path: Path,
    data_root: Path,
    labels_csv: Path,
    batch_size: int = 32,
) -> None:
    from sklearn.metrics import (
        classification_report,
        confusion_matrix,
        roc_auc_score,
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    ds = ISICClassificationDataset(root=data_root, labels_csv=labels_csv, transform=None)
    loader = DataLoader(ds, batch_size=batch_size, shuffle=False, num_workers=4)

    model = EfficientNetB0Classifier(pretrained=False).to(device)
    state = torch.load(model_path, map_location=device)
    model.load_state_dict(state["model_state"])
    model.eval()

    all_labels = []
    all_probs = []

    for images, labels in tqdm(loader, desc="Eval Classifier"):
        images = images.to(device)
        labels = labels.to(device)

        logits = model(images)
        probs = torch.sigmoid(logits)

        all_labels.extend(labels.cpu().numpy().tolist())
        all_probs.extend(probs.cpu().numpy().tolist())

    preds = [1 if p >= 0.5 else 0 for p in all_probs]

    auc = roc_auc_score(all_labels, all_probs)
    cm = confusion_matrix(all_labels, preds)
    report = classification_report(all_labels, preds, digits=4)

    print(f"AUC-ROC: {auc:.4f}")
    print("Confusion Matrix:")
    print(cm)
    print("Classification Report:")
    print(report)


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate CutisAI models")
    subparsers = parser.add_subparsers(dest="task", required=True)

    seg_parser = subparsers.add_parser("segmentation")
    seg_parser.add_argument("--model-path", type=Path, required=True)
    seg_parser.add_argument("--data-root", type=Path, required=True)
    seg_parser.add_argument("--split-csv", type=Path, required=True)

    clf_parser = subparsers.add_parser("classification")
    clf_parser.add_argument("--model-path", type=Path, required=True)
    clf_parser.add_argument("--data-root", type=Path, required=True)
    clf_parser.add_argument("--labels-csv", type=Path, required=True)

    args = parser.parse_args()

    if args.task == "segmentation":
        evaluate_segmentation(
            model_path=args.model_path,
            data_root=args.data_root,
            split_csv=args.split_csv,
        )
    elif args.task == "classification":
        evaluate_classifier(
            model_path=args.model_path,
            data_root=args.data_root,
            labels_csv=args.labels_csv,
        )


if __name__ == "__main__":
    main()
