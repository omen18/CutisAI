from typing import Any

import torch
import torch.nn as nn
from torchvision.models import resnet18


class ConvBlock(nn.Module):
    def __init__(self, in_channels: int, out_channels: int) -> None:
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:  # type: ignore[override]
        return self.block(x)


class UpBlock(nn.Module):
    def __init__(self, in_channels: int, skip_channels: int, out_channels: int) -> None:
        super().__init__()
        self.up = nn.ConvTranspose2d(in_channels, out_channels, kernel_size=2, stride=2)
        self.conv = ConvBlock(out_channels + skip_channels, out_channels)

    def forward(
        self,
        x: torch.Tensor,
        skip: torch.Tensor,
    ) -> torch.Tensor:  # type: ignore[override]
        x = self.up(x)
        # pad if needed for odd input sizes
        diff_y = skip.size(2) - x.size(2)
        diff_x = skip.size(3) - x.size(3)
        x = nn.functional.pad(
            x,
            [diff_x // 2, diff_x - diff_x // 2, diff_y // 2, diff_y - diff_y // 2],
        )
        x = torch.cat([skip, x], dim=1)
        return self.conv(x)


class ResUNet(nn.Module):
    """
    ResUNet with ResNet-18 encoder for binary segmentation.
    """

    def __init__(self, pretrained: bool = True) -> None:
        super().__init__()
        backbone = resnet18(weights="IMAGENET1K_V1" if pretrained else None)

        self.input_block = nn.Sequential(
            backbone.conv1,
            backbone.bn1,
            backbone.relu,
        )  # 64, /2
        self.pool = backbone.maxpool
        self.encoder1 = backbone.layer1  # 64
        self.encoder2 = backbone.layer2  # 128
        self.encoder3 = backbone.layer3  # 256
        self.encoder4 = backbone.layer4  # 512

        self.center = ConvBlock(512, 512)

        self.up4 = UpBlock(512, 256, 256)
        self.up3 = UpBlock(256, 128, 128)
        self.up2 = UpBlock(128, 64, 64)
        self.up1 = UpBlock(64, 64, 64)

        self.final_conv = nn.Conv2d(64, 1, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:  # type: ignore[override]
        x0 = self.input_block(x)
        x1 = self.encoder1(self.pool(x0))
        x2 = self.encoder2(x1)
        x3 = self.encoder3(x2)
        x4 = self.encoder4(x3)

        center = self.center(x4)

        d4 = self.up4(center, x3)
        d3 = self.up3(d4, x2)
        d2 = self.up2(d3, x1)
        d1 = self.up1(d2, x0)

        logits = self.final_conv(d1)
        return logits

