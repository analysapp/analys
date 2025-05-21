from PIL import Image
from core.ocr_utils import extrair_linhas_tesseract

# Caminho da imagem de teste
caminho_imagem = r"C:\Users\MOOD\Desktop\carimbo_recortado - Copia.jpg"  # ajuste se necessário

# Abre a imagem e executa o OCR
imagem = Image.open(caminho_imagem)
linhas = extrair_linhas_tesseract(imagem)

# Mostra o resultado linha a linha
print("🧾 Linhas extraídas pelo OCR:\n")
for linha in linhas:
    print("-", linha)
