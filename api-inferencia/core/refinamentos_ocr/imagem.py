from PIL import Image, ImageEnhance
import numpy as np
import cv2

def refinar_imagem_para_ocr(image_pil: Image.Image, fator: float = 2.0) -> Image.Image:
    """
    Aplica melhorias na imagem para aumentar a precisão do OCR:
    - Redimensionamento
    - Aumento de nitidez
    - Contraste adaptativo (CLAHE)
    """
    # Redimensiona
    nova_largura = int(image_pil.width * fator)
    nova_altura = int(image_pil.height * fator)
    image_pil = image_pil.resize((nova_largura, nova_altura), Image.LANCZOS)

    # Aumenta nitidez
    image_pil = ImageEnhance.Sharpness(image_pil).enhance(2.0)

    # Aplica CLAHE (adaptive contrast)
    img_gray = np.array(image_pil.convert("L"))
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_clahe = clahe.apply(img_gray)

    return Image.fromarray(img_clahe).convert("RGB")
