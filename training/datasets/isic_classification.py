from pathlib import Path
from typing import Callable, Optional, Tuple

import numpy as np
import torch
from PIL import Image
from torch.utils.data import Dataset


class ISICClassificationDataset(Dataset):
    """
    ISIC classification dataset for benign vs malignant.

    Assumes a CSV file with columns: image_id,label where label is 0 (benign)
    or 1 (malignant).
    """

    def __init__(
        self,
        root: str | Path,
        labels_csv: str | Path,
        transform: Optional[Callable] = None,
    ) -> None:
        self.root = Path(root)
        self.transform = transform

        self.samples = []
        with open(labels_csv, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.lower().startswith("image_id"):
                    continue
                image_id, label_str = line.split(",")
                self.samples.append((image_id, int(label_str)))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        image_id, label = self.samples[idx]
        img_path = next(iter(self.root.glob(f"{image_id}.*")))

        image = Image.open(img_path).convert("RGB")
        image_np = np.array(image)

        if self.transform:
            augmented = self.transform(image=image_np)
            image_np = augmented["image"]

        image_tensor = torch.from_numpy(image_np).permute(2, 0, 1).float() / 255.0
        label_tensor = torch.tensor(label, dtype=torch.float32)

        return image_tensor, label_tensor

