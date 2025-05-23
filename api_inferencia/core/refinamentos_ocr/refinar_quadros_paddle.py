from paddleocr import PaddleOCR
import numpy as np
from typing import List
from PIL import Image

# Inicializa apenas uma vez
ocr_engine = PaddleOCR(use_angle_cls=False, lang='pt')

def extrair_linhas_paddle(imagem: Image.Image) -> List[str]:
    resultado = ocr_engine.ocr(np.array(imagem), cls=False)
    linhas = []
    for linha in resultado[0]:
        texto, conf = linha[1][0], linha[1][1]
        if texto.strip():
            linhas.append(texto.strip())
    return linhas
