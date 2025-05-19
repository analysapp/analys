import os
import torch
import yaml
from detectron2.config import get_cfg
from detectron2.data import build_detection_test_loader, DatasetCatalog, MetadataCatalog
from detectron2.data.datasets import register_coco_instances
from detectron2.engine import DefaultPredictor
from detectron2.evaluation import COCOEvaluator, inference_on_dataset
from detectron2.model_zoo import get_config_file

# Caminhos
yaml_config_path = "D:/detectron2_analys/config.yaml"
weights_path = "D:/detectron2_analys/outputs/model_final.pth"
json_valid_path = "D:/detectron2_analys/valid.json"
image_valid_dir = "D:/detectron2_analys/images/valid"

# Registro do dataset de validação
register_coco_instances("analys_valid", {}, json_valid_path, image_valid_dir)

def avaliar_modelo():
    # Carrega configuração base do Detectron2 para FPN
    cfg = get_cfg()
    cfg.merge_from_file(get_config_file("COCO-Detection/faster_rcnn_R_50_FPN_3x.yaml"))

    # Carrega seu config.yaml com encoding compatível
    with open(yaml_config_path, "r", encoding="utf-8") as f:
        yaml_cfg = yaml.safe_load(f)

    # Atualiza parâmetros do config.yaml carregado
    flat_config = {}

    def flatten_dict(d, parent_key=''):
        for k, v in d.items():
            full_key = f"{parent_key}.{k}" if parent_key else k
            if isinstance(v, dict):
                flatten_dict(v, full_key)
            else:
                flat_config[full_key.upper()] = v

    flatten_dict(yaml_cfg)

    # Atualiza config
    cfg.merge_from_list(sum([[k, str(v)] for k, v in flat_config.items()], []))

    # Corrige chave ausente se necessário
    if not hasattr(cfg.MODEL.BACKBONE, "IN_FEATURES"):
        cfg.MODEL.BACKBONE.IN_FEATURES = ["res2", "res3", "res4", "res5"]

    cfg.MODEL.WEIGHTS = weights_path
    cfg.MODEL.DEVICE = "cpu"  # evita erro de CUDA
    cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5  # threshold padrão

    # Inicializa preditor e dataloader
    predictor = DefaultPredictor(cfg)
    val_loader = build_detection_test_loader(cfg, "analys_valid")

    # Avaliador COCO
    evaluator = COCOEvaluator("analys_valid", cfg, False, output_dir="./output/")
    print("🔍 Iniciando avaliação...")
    results = inference_on_dataset(predictor.model, val_loader, evaluator)
    print("✅ Avaliação concluída:")
    print(results)

if __name__ == "__main__":
    avaliar_modelo()
