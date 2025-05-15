import torch
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
import torchvision.transforms as T
import os
import torch.nn as nn

# === Classe UNet ===
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

# === Caminhos ===
MODEL_PATH = r"D:\testeanalys\modelo_unet.pth"
IMAGE_PATH = r"D:\segmentacao_unet\recortes\memoria_calculo_permeabilidade\01 (27).jpg"
IMG_SIZE = (256, 256)

# === Carrega modelo ===
model = UNet(n_classes=2)
model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
model.eval()

# === Prepara imagem ===
image_orig = Image.open(IMAGE_PATH).convert("RGB")
image_resized = image_orig.resize(IMG_SIZE)
image_tensor = T.ToTensor()(image_resized).unsqueeze(0)  # [1, 3, H, W]

# === Inferência ===
with torch.no_grad():
    output = model(image_tensor)
    pred_mask = torch.argmax(output, dim=1).squeeze().cpu().numpy()  # [H, W]

# === Converte máscara binária para imagem colorida
mask_rgb = np.zeros((IMG_SIZE[1], IMG_SIZE[0], 3), dtype=np.uint8)
mask_rgb[pred_mask == 1] = [255, 0, 0]  # vermelho para hachura

# === Reescala para o tamanho original da imagem
mask_pil = Image.fromarray(mask_rgb).resize(image_orig.size)
image_overlay = Image.blend(image_orig, mask_pil, alpha=0.4)

# === Exibe o resultado
plt.figure(figsize=(12, 6))
plt.subplot(1, 3, 1)
plt.imshow(image_orig)
plt.title("Imagem Original")
plt.axis("off")

import matplotlib
matplotlib.use("Agg")  # usa modo silencioso para garantir compatibilidade

...

# === Salva o resultado
output_path = "resultado_inferencia.png"
image_overlay.save(output_path)
print(f"🖼️ Resultado salvo como '{output_path}'")

# === (Opcional) Exibe inline no Jupyter ou VSCode com suporte
try:
    plt.figure(figsize=(12, 6))
    plt.subplot(1, 3, 1)
    plt.imshow(image_orig)
    plt.title("Imagem Original")
    plt.axis("off")

    plt.subplot(1, 3, 2)
    plt.imshow(pred_mask, cmap="gray")
    plt.title("Máscara Prevista")
    plt.axis("off")

    plt.subplot(1, 3, 3)
    plt.imshow(image_overlay)
    plt.title("Sobreposição")
    plt.axis("off")

    plt.tight_layout()
    plt.show()
except Exception as e:
    print(f"⚠️ Não foi possível exibir a imagem. Motivo: {e}")


