import torch
import torch.nn as nn

from .dice import DiceLoss
from .focal import FocalLoss


class HybridSegmentationLoss(nn.Module):
    """
    Hybrid loss: 0.5 * Dice + 0.5 * Focal for segmentation.
    """

    def __init__(self, alpha: float = 0.25, gamma: float = 2.0) -> None:
        super().__init__()
        self.dice = DiceLoss()
        self.focal = FocalLoss(alpha=alpha, gamma=gamma)

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:  # type: ignore[override]
        dice_loss = self.dice(logits, targets)
        focal_loss = self.focal(logits, targets)
        return 0.5 * dice_loss + 0.5 * focal_loss

