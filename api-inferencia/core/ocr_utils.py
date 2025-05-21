# core/ocr_utils.py

import os
import pytesseract
import pandas as pd
from PIL import Image
import numpy as np
import cv2
import re

# Garante que o Tesseract encontre o idioma "por"
os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"

# 🔧 Pré-processamento para melhorar a leitura do OCR
def preparar_imagem_para_ocr(image_pil: Image.Image) -> Image.Image:
    # Redimensiona (escala 2x) para melhorar precisão
    image_pil = image_pil.resize((image_pil.width * 2, image_pil.height * 2), Image.LANCZOS)

    # Converte para escala de cinza
    img = np.array(image_pil.convert("L"))

    # Aplica binarização adaptativa com Otsu
    _, thresh = cv2.threshold(img, 180, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return Image.fromarray(thresh)

# 🔄 Remove palavras duplicadas consecutivas (erro comum do Tesseract)
def remover_palavras_duplicadas(linha: str) -> str:
    palavras = linha.split()
    resultado = [palavras[0]] if palavras else []
    for p in palavras[1:]:
        if p != resultado[-1]:
            resultado.append(p)
    return " ".join(resultado)

# 🧠 Função principal para extração de texto com agrupamento por linha
def extrair_linhas_tesseract(image_pil: Image.Image) -> list[str]:
    print("🔎 Iniciando extração com OCR...")
    # Aplica pré-processamento
    image_pil = preparar_imagem_para_ocr(image_pil)

    # Configura modo de segmentação para leitura de blocos de texto
    custom_config = r'--oem 3 --psm 6'

    # Executa OCR com estrutura em formato de DataFrame
    df = pytesseract.image_to_data(
        image_pil, lang="por", config=custom_config, output_type=pytesseract.Output.DATAFRAME
    )
    df["text"] = df["text"].astype(str)  # 🔒 força string para evitar erro com float64

    # 🔒 Filtro seguro: remove linhas com texto vazio
    linhas_validas = []
    for i, row in df.iterrows():
        texto = row.get("text", "")
        if isinstance(texto, str) and texto.strip():
            linhas_validas.append(row)

    df = pd.DataFrame(linhas_validas)

    # Agrupa textos por linha visual detectada (com base em block, par e line)
    linhas_agrupadas = []
    ultima_linha = (-1, -1, -1)
    linha_atual = []

    for _, row in df.iterrows():
        texto = row.get("text", "")
        if not isinstance(texto, str):
            texto = str(texto)
        linha_id = (row['block_num'], row['par_num'], row['line_num'])

        if linha_id != ultima_linha:
            if linha_atual:
                linhas_agrupadas.append(" ".join(linha_atual))
            linha_atual = [texto.strip()]
            ultima_linha = linha_id
        else:
            linha_atual.append(texto.strip())

    if linha_atual:
        linhas_agrupadas.append(" ".join(linha_atual))

    # 🧹 Limpeza de ruído e filtro inteligente
    linhas_agrupadas = [
        remover_palavras_duplicadas(l)  # Remove repetições como "Rua Rua"
        for l in linhas_agrupadas
        if isinstance(l, str) and len(l) > 3
        and not any(p in l.upper() for p in ["AUTOCAD", "TEXT", "SHX", ".SHX", ".DWG"])
        and (
            not re.fullmatch(r"[\d\s\-.,]+", l)
            or re.search(
                r"(bairro|zona|quadra|lote|zoneamento|uso|área|c\.a\.|propriet[aá]rio|respons[aá]vel|prancha)",
                l,
                re.IGNORECASE
            )
        )
    ]

    return linhas_agrupadas