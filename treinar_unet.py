import os
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
import torch.nn as nn
from PIL import Image
from tqdm import tqdm

# Albumentations para data augmentation
import albumentations as A
from albumentations.pytorch import ToTensorV2

# === Configurações ===
IMG_DIR = "D:/segmentacao_unet/images"
MASK_DIR = "D:/segmentacao_unet/masks"
IMG_SIZE = (256, 256)
EPOCHS = 20
BATCH_SIZE = 4
NUM_CLASSES = 2  # 0 = fundo, 1 = hachura

# === Dataset com data augmentation ===
class SegmentacaoDataset(Dataset):
    def __init__(self, img_dir, mask_dir, augment=True):
        self.img_dir = img_dir
        self.mask_dir = mask_dir
        self.images = sorted([f for f in os.listdir(img_dir) if f.endswith(".jpg")])
        self.augment = augment

        self.transform = A.Compose([
            A.Resize(*IMG_SIZE),
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.5),
            A.RandomRotate90(p=0.5),
            A.RandomBrightnessContrast(p=0.3),
            A.GaussianBlur(p=0.2),
            ToTensorV2()
        ])

        self.transform_no_aug = A.Compose([
            A.Resize(*IMG_SIZE),
            ToTensorV2()
        ])

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_name = self.images[idx]
        img_path = os.path.join(self.img_dir, img_name)

        base_name = os.path.splitext(img_name)[0].replace("_corrigida", "")
        mask_name = base_name + "_corrigida.png"
        mask_path = os.path.join(self.mask_dir, mask_name)

        image = np.array(Image.open(img_path).convert("RGB"))
        mask = np.array(Image.open(mask_path).convert("L"))
        mask = (mask > 128).astype(np.uint8)

        if self.augment:
            transformed = self.transform(image=image, mask=mask)
        else:
            transformed = self.transform_no_aug(image=image, mask=mask)

        image = transformed["image"]
        mask = transformed["mask"].long()

        return image, mask

# === Definição da U-Net ===
class UNet(nn.Module):
    def __init__(self, n_classes):
        super().__init__()

        def CBR(in_c, out_c):
            return nn.Sequential(
                nn.Conv2d(in_c, out_c, 3, padding=1),
                nn.BatchNorm2d(out_c),
                nn.ReLU(inplace=True)
            )

        self.enc1 = nn.Sequential(CBR(3, 64), CBR(64, 64))
        self.pool1 = nn.MaxPool2d(2)
        self.enc2 = nn.Sequential(CBR(64, 128), CBR(128, 128))
        self.pool2 = nn.MaxPool2d(2)

        self.bottleneck = nn.Sequential(CBR(128, 256), CBR(256, 256))

        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = nn.Sequential(CBR(256, 128), CBR(128, 128))
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = nn.Sequential(CBR(128, 64), CBR(64, 64))

        self.final = nn.Conv2d(64, n_classes, 1)

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool1(e1))
        b = self.bottleneck(self.pool2(e2))
        d2 = self.dec2(torch.cat([self.up2(b), e2], dim=1))
        d1 = self.dec1(torch.cat([self.up1(d2), e1], dim=1))
        return self.final(d1)

# === Treinamento ===
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Usando dispositivo: {device}")

dataset = SegmentacaoDataset(IMG_DIR, MASK_DIR, augment=True)
loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

model = UNet(NUM_CLASSES).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(EPOCHS):
    print(f"\n🔄 Iniciando época {epoch+1}/{EPOCHS}...")
    model.train()
    total_loss = 0
    for images, masks in tqdm(loader, desc="Treinando", leave=False):
        images, masks = images.to(device), masks.to(device)
        outputs = model(images)
        loss = criterion(outputs, masks)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(f"✅ Época {epoch+1} finalizada — Loss: {total_loss:.4f}")

# === Salvar modelo ===
torch.save(model.state_dict(), "modelo_unet.pth")
print("✅ Modelo salvo como 'modelo_unet.pth'")
