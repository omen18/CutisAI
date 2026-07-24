import argparse
from pathlib import Path

import albumentations as A
import torch
from albumentations.pytorch import ToTensorV2
from torch.utils.data import DataLoader
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from tqdm import tqdm

from datasets import ISICSegmentationDataset
from losses import HybridSegmentationLoss
from models import ResUNet


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
    model: ResUNet,
    loader: DataLoader,
    criterion: HybridSegmentationLoss,
    optimizer: AdamW,
    device: torch.device,
) -> float:
    model.train()
    running_loss = 0.0
    for images, masks in tqdm(loader, desc="Train", leave=False):
        images = images.to(device)
        masks = masks.to(device)

        optimizer.zero_grad(set_to_none=True)
        logits = model(images)
        loss = criterion(logits, masks)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)

    return running_loss / len(loader.dataset)


@torch.no_grad()
def evaluate_dice(
    model: ResUNet,
    loader: DataLoader,
    device: torch.device,
) -> float:
    model.eval()
    total_dice = 0.0
    n_samples = 0

    for images, masks in tqdm(loader, desc="Val", leave=False):
        images = images.to(device)
        masks = masks.to(device)

        logits = model(images)
        probs = torch.sigmoid(logits)
        preds = (probs > 0.5).float()

        intersection = (preds * masks).sum(dim=(1, 2, 3))
        denom = preds.sum(dim=(1, 2, 3)) + masks.sum(dim=(1, 2, 3))
        dice = (2 * intersection + 1.0) / (denom + 1.0)

        total_dice += dice.sum().item()
        n_samples += images.size(0)

    return total_dice / max(n_samples, 1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train ResUNet segmentation model")
    parser.add_argument("--data-root", type=Path, required=True)
    parser.add_argument("--train-split", type=Path, required=True)
    parser.add_argument("--val-split", type=Path, required=True)
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--output-dir", type=Path, default=Path("checkpoints"))
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_ds = ISICSegmentationDataset(
        root=args.data_root,
        split_csv=args.train_split,
        transform=get_transforms(),
    )
    val_ds = ISICSegmentationDataset(
        root=args.data_root,
        split_csv=args.val_split,
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

    model = ResUNet(pretrained=True).to(device)
    criterion = HybridSegmentationLoss()
    optimizer = AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    best_dice = 0.0

    for epoch in range(1, args.epochs + 1):
        train_loss = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_dice = evaluate_dice(model, val_loader, device)
        scheduler.step()

        print(
            f"Epoch {epoch}/{args.epochs} "
            f"- train_loss={train_loss:.4f} val_dice={val_dice:.4f}"
        )

        if val_dice > best_dice:
            best_dice = val_dice
            ckpt_path = args.output_dir / "resunet_best.pth"
            torch.save(
                {
                    "epoch": epoch,
                    "model_state": model.state_dict(),
                    "optimizer_state": optimizer.state_dict(),
                    "val_dice": val_dice,
                },
                ckpt_path,
            )
            print(f"Saved new best checkpoint to {ckpt_path} (dice={val_dice:.4f})")


if __name__ == "__main__":
    main()
