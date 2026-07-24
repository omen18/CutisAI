from pathlib import Path
from typing import Callable, Optional, Tuple

import numpy as np
import torch
from PIL import Image
from torch.utils.data import Dataset


class ISICSegmentationDataset(Dataset):
    """
    ISIC 2018 / 2019 / 2020 segmentation dataset wrapper.

    Expects a directory layout such as:

    root/
      images/
        *.jpg|*.png
      masks/
        *_segmentation.png
    """

    def __init__(
        self,
        root: str | Path,
        split_csv: Optional[str | Path] = None,
        transform: Optional[Callable] = None,
    ) -> None:
        self.root = Path(root)
        self.images_dir = self.root / "images"
        self.masks_dir = self.root / "masks"
        self.transform = transform

        if split_csv:
            with open(split_csv, "r", encoding="utf-8") as f:
                ids = [line.strip() for line in f if line.strip()]
            self.ids = ids
        else:
            self.ids = [p.stem for p in sorted(self.images_dir.glob("*"))]

    def __len__(self) -> int:
        return len(self.ids)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        sample_id = self.ids[idx]
        img_path = next(iter((self.images_dir).glob(f"{sample_id}.*")))
        mask_path = self.masks_dir / f"{sample_id}_segmentation.png"

        image = Image.open(img_path).convert("RGB")
        mask = Image.open(mask_path).convert("L")

        image_np = np.array(image)
        mask_np = (np.array(mask) > 0).astype("uint8")

        if self.transform:
            augmented = self.transform(image=image_np, mask=mask_np)
            image_np = augmented["image"]
            mask_np = augmented["mask"]

        # HWC -> CHW
        image_tensor = torch.from_numpy(image_np).permute(2, 0, 1).float() / 255.0
        mask_tensor = torch.from_numpy(mask_np).unsqueeze(0).float()

        return image_tensor, mask_tensor

