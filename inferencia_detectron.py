import cv2
import torch
from detectron2.config import get_cfg
from detectron2.engine import DefaultPredictor
from detectron2.utils.visualizer import Visualizer
from detectron2.data import MetadataCatalog
import matplotlib.pyplot as plt

# Caminho da imagem (verifique se a extensão está correta)
image_path = "D:/detectron2_analys/images/valid/01-13-_jpg.rf.ea451183565702e2191a6a3c99db2216.jpg"
image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"❌ Imagem não encontrada ou caminho inválido: {image_path}")

# Carrega config
cfg = get_cfg()
cfg.merge_from_file("D:/detectron2_analys/config.yaml")
cfg.MODEL.DEVICE = "cpu"  # força uso da CPU

# Inicializa o predictor
predictor = DefaultPredictor(cfg)
outputs = predictor(image)

# Visualização
v = Visualizer(image[:, :, ::-1], metadata=MetadataCatalog.get(cfg.DATASETS.TEST[0]), scale=1.0)
out = v.draw_instance_predictions(outputs["instances"].to("cpu"))

# Salva resultado
output_path = "resultado_detectron.jpg"
cv2.imwrite(output_path, out.get_image()[:, :, ::-1])
print(f"✅ Resultado salvo como {output_path}")
