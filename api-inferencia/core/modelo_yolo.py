import os
from ultralytics import YOLO

# Caminho fixo do projeto
base_dir = r"D:\testeanalys\api-inferencia"
model_path = os.path.join(base_dir, "weights", "best.pt")
model = YOLO(model_path)
