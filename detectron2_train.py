import os
from detectron2.engine import DefaultTrainer
from detectron2.config import get_cfg
from detectron2.data.datasets import register_coco_instances
from detectron2 import model_zoo

if __name__ == "__main__":
    BASE_DIR = "D:/detectron2_analys"
    register_coco_instances("analys_train", {}, f"{BASE_DIR}/annotations/train.json", f"{BASE_DIR}/images/train")
    register_coco_instances("analys_val", {}, f"{BASE_DIR}/annotations/valid.json", f"{BASE_DIR}/images/val")  # <- aqui foi ajustado

    cfg = get_cfg()
    cfg.merge_from_file(model_zoo.get_config_file("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml"))
    cfg.DATASETS.TRAIN = ("analys_train",)
    cfg.DATASETS.TEST = ("analys_val",)
    cfg.DATALOADER.NUM_WORKERS = 0  # <- evita erro no Windows
    cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml")
    cfg.SOLVER.IMS_PER_BATCH = 2
    cfg.SOLVER.BASE_LR = 0.00025
    cfg.SOLVER.MAX_ITER = 3000
    cfg.MODEL.ROI_HEADS.BATCH_SIZE_PER_IMAGE = 128
    cfg.MODEL.ROI_HEADS.NUM_CLASSES = 2  # ou 1, conforme suas classes
    cfg.MODEL.DEVICE = "cpu"
    cfg.OUTPUT_DIR = f"{BASE_DIR}/outputs"
    os.makedirs(cfg.OUTPUT_DIR, exist_ok=True)

    trainer = DefaultTrainer(cfg)
    trainer.resume_or_load(resume=False)
    trainer.train()
