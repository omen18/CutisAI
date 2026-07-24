import argparse
from pathlib import Path

import albumentations as A
import torch
from albumentations.pytorch import ToTensorV2
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader
from tqdm import tqdm

from datasets import ISICClassificationDataset
from models import EfficientNetB0Classifier


def get_transforms(image_size: int = 256) -> A.Compose:
    return A.Compose(
        [
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.5),
            A.Rotate(limit=30, p=0.5),
            A.RandomResizedCrop(image_size, image_size, scale=(0.8, 1.0), p=1.0),
            A.ColorJitter(p=0.3),
            A.RandomBrightnessContrast(p=0.3),
            A.HueSaturationValue(p=0.2),
            A.GaussNoise(var_limit=(10, 50), p=0.2),
            A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2(),
        ]
    )


def train_one_epoch(
    model: EfficientNetB0Classifier,
    loader: DataLoader,
    criterion: torch.nn.Module,
    optimizer: AdamW,
    device: torch.device,
) -> float:
    model.train()
    running_loss = 0.0
    for images, labels in tqdm(loader, desc="Train", leave=False):
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad(set_to_none=True)
        logits = model(images)
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)

    return running_loss / len(loader.dataset)


@torch.no_grad()
def evaluate_auc(
    model: EfficientNetB0Classifier,
    loader: DataLoader,
    device: torch.device,
) -> float:
    from sklearn.metrics import roc_auc_score

    model.eval()
    all_labels = []
    all_probs = []

    for images, labels in tqdm(loader, desc="Val", leave=False):
        images = images.to(device)
        labels = labels.to(device)

        logits = model(images)
        probs = torch.sigmoid(logits)

        all_labels.extend(labels.cpu().numpy().tolist())
        all_probs.extend(probs.cpu().numpy().tolist())

    if len(set(all_labels)) < 2:
        return 0.0

    return float(roc_auc_score(all_labels, all_probs))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train EfficientNet-B0 benign/malignant classifier"
    )
    parser.add_argument("--data-root", type=Path, required=True)
    parser.add_argument("--train-labels", type=Path, required=True)
    parser.add_argument("--val-labels", type=Path, required=True)
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--pos-weight", type=float, default=1.0)
    parser.add_argument("--output-dir", type=Path, default=Path("checkpoints"))
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_ds = ISICClassificationDataset(
        root=args.data_root,
        labels_csv=args.train_labels,
        transform=get_transforms(),
    )
    val_ds = ISICClassificationDataset(
        root=args.data_root,
        labels_csv=args.val_labels,
        transform=get_transforms(),
    )

    train_loader = DataLoader(
        train_ds,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=4,
        pin_memory=True,
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=4,
        pin_memory=True,
    )

    model = EfficientNetB0Classifier(pretrained=True).to(device)
    pos_weight = torch.tensor([args.pos_weight], device=device)
    criterion = torch.nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    optimizer = AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    best_auc = 0.0

    for epoch in range(1, args.epochs + 1):
        train_loss = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_auc = evaluate_auc(model, val_loader, device)
        scheduler.step()

        print(
            f"Epoch {epoch}/{args.epochs} "
            f"- train_loss={train_loss:.4f} val_auc={val_auc:.4f}"
        )

        if val_auc > best_auc:
            best_auc = val_auc
            ckpt_path = args.output_dir / "efficientnet_b0_best.pth"
            torch.save(
                {
                    "epoch": epoch,
                    "model_state": model.state_dict(),
                    "optimizer_state": optimizer.state_dict(),
                    "val_auc": val_auc,
                },
                ckpt_path,
            )
            print(f"Saved new best checkpoint to {ckpt_path} (auc={val_auc:.4f})")


if __name__ == "__main__":
    main()
