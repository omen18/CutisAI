import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights


class EfficientNetB0Classifier(nn.Module):
    """
    EfficientNet-B0 binary classifier (benign vs malignant).
    """

    def __init__(self, pretrained: bool = True) -> None:
        super().__init__()
        if pretrained:
            weights = EfficientNet_B0_Weights.IMAGENET1K_V1
            backbone = efficientnet_b0(weights=weights)
        else:
            backbone = efficientnet_b0(weights=None)

        num_features = backbone.classifier[1].in_features
        backbone.classifier[1] = nn.Identity()

        self.backbone = backbone
        self.classifier_head = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:  # type: ignore[override]
        features = self.backbone(x)
        logits = self.classifier_head(features)
        return logits.view(-1)

