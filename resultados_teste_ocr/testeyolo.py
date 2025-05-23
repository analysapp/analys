from pdf2image import convert_from_path
from ultralytics import YOLO
from PIL import Image, ImageEnhance
import numpy as np
import cv2
import os
from paddleocr import PaddleOCR

# 📁 CONFIGURAÇÕES
pdf_path = r"D:\testeanalys\pdfs\TESTE09.pdf"
poppler_path = r"C:\poppler\bin"
modelo_path = r"D:\yolov8\runs\detect\train11 - separação de plantas\weights\best.pt"
saida_base = "resultados_teste_ocr"
tamanho_saida = (8000, 5000)
padding = 15

# Inicializa YOLO
model = YOLO(modelo_path)

# Inicializa PaddleOCR (CPU-friendly)
ocr_engine = PaddleOCR(use_angle_cls=False, lang='pt')  # versão 2.6.1.3

# Cria pasta base
os.makedirs(saida_base, exist_ok=True)

# Converte PDF
paginas = convert_from_path(pdf_path, dpi=300, poppler_path=poppler_path)
print(f"🔍 Total de páginas convertidas: {len(paginas)}")

for idx, pagina in enumerate(paginas):
    print(f"📄 Página {idx + 1}")
    nome_base = f"pagina_{idx+1:02}"
    results = model(pagina)[0]

    for i, det in enumerate(results.boxes):
        cls = int(det.cls.item())
        nome_classe = model.names[cls]

        # Coordenadas com padding
        x1, y1, x2, y2 = map(int, det.xyxy[0])
        x1, y1 = max(x1 - padding, 0), max(y1 - padding, 0)
        x2, y2 = min(x2 + padding, pagina.width), min(y2 + padding, pagina.height)

        # Recorte e melhorias
        recorte = pagina.crop((x1, y1, x2, y2)).resize(tamanho_saida, Image.LANCZOS)
        recorte = ImageEnhance.Sharpness(recorte).enhance(2.0)

        # Binarização e remoção de ruído
        img_np = np.array(recorte.convert("L"))
        _, binarizada = cv2.threshold(img_np, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        limpa = cv2.morphologyEx(binarizada, cv2.MORPH_OPEN, np.ones((1, 1), np.uint8))
        imagem_final = Image.fromarray(limpa)

        # Salva imagem
        pasta_classe = os.path.join(saida_base, nome_classe)
        os.makedirs(pasta_classe, exist_ok=True)
        nome_arquivo = f"{nome_base}_{nome_classe}_{i:03}.jpg"
        caminho_imagem = os.path.join(pasta_classe, nome_arquivo)
        imagem_final.save(caminho_imagem)

        # OCR com PaddleOCR (linha por linha)
        resultado_ocr = ocr_engine.ocr(np.array(imagem_final), cls=False)
        linhas = []
        for linha in resultado_ocr[0]:
            texto, confianca = linha[1][0], linha[1][1]
            if texto.strip():
                linhas.append(f"{texto} (conf: {confianca:.2f})")

        # Salva resultado em .txt
        pasta_texto = os.path.join(saida_base, "textos_extraidos_paddle")
        os.makedirs(pasta_texto, exist_ok=True)
        with open(os.path.join(pasta_texto, nome_arquivo.replace(".jpg", ".txt")), "w", encoding="utf-8") as f:
            f.write("\n".join(linhas))

print("✅ Processo finalizado com PaddleOCR CPU.")
