from PIL import Image
Image.MAX_IMAGE_PIXELS = 200_000_000  # aumenta para 200 MP

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from pdf2image import convert_from_bytes
import numpy as np
import pytesseract
import json
import io
import os
import uuid
import re
import requests

from api_inferencia.core.modelo_yolo import model, base_dir
from api_inferencia.core.ocr_utils import extrair_linhas_tesseract
from api_inferencia.core.refinamentos_ocr.imagem import refinar_imagem_para_ocr
from api_inferencia.core.refinamentos_ocr.planta_implantacao import analisar_implantacao
from api_inferencia.core.refinamentos_ocr.carimbo import analisar_carimbo
from api_inferencia.core.refinamentos_ocr.quadro_permeabilidade import refinar_quadro_permeabilidade
from api_inferencia.core.refinamentos_ocr.refinar_quadros_paddle import extrair_linhas_paddle


router = APIRouter()

@router.post("/inferir")
async def inferir_imagem(file: UploadFile = File(...)):
    try:
        print("📥 Arquivo recebido:", file.filename)
        contents = await file.read()

        id_resultado = str(uuid.uuid4())
        pasta_resultado = os.path.join(base_dir, "resultados", id_resultado)
        os.makedirs(pasta_resultado, exist_ok=True)

        print("📄 Convertendo imagem/PDF...")
        import warnings
        warnings.simplefilter('ignore', Image.DecompressionBombWarning)
        Image.MAX_IMAGE_PIXELS = None

        if not file.filename.lower().endswith(".pdf"):
            image = Image.open(io.BytesIO(contents)).convert("RGB")
        else:
            imagens = convert_from_bytes(
                contents,
                dpi=400,
                fmt="jpeg",
                poppler_path="C:/poppler/bin"
            )
            Image.MAX_IMAGE_PIXELS = None
            image = imagens[0].convert("RGB")  # força RGB para garantir consistência de cores

            from PIL import ImageEnhance
            image = ImageEnhance.Sharpness(image).enhance(1.5)  # aplica nitidez leve

        # Defina os limites máximos para largura e altura da imagem
        largura_maxima = 8000  # ajuste conforme necessário
        altura_maxima = 5000   # ajuste conforme necessário

        if image.width > largura_maxima or image.height > altura_maxima:
            fator_w = largura_maxima / image.width
            fator_h = altura_maxima / image.height
            fator = min(fator_w, fator_h)
            nova_size = (int(image.width * fator), int(image.height * fator))
            image = image.resize(nova_size, Image.LANCZOS)
            print(f"⚠️ Imagem redimensionada para {nova_size} para evitar estouro de pixels.")

        print("🔍 Rodando inferência com YOLOv8...")
        image_np = np.array(image)
        resultados = model.predict(image_np, conf=0.4, iou=0.5)

        textos_por_classe = {}
        caixas_detectadas = []
        analises_semanticas = {}

        print("✂️ Recortando quadros e executando OCR...")

        PADDING = 15
        for box in resultados[0].boxes:
            classe = model.names[int(box.cls)].strip().lower().replace(" ", "_")  # normaliza nome
            confianca = float(box.conf)

            x1 = max(int(box.xyxy[0][0]) - PADDING, 0)
            y1 = max(int(box.xyxy[0][1]) - PADDING, 0)
            x2 = min(int(box.xyxy[0][2]) + PADDING, image.width)
            y2 = min(int(box.xyxy[0][3]) + PADDING, image.height)
            recorte = image.crop((x1, y1, x2, y2))

            # Aplica refino total apenas para classes importantes
            if classe in [
                "carimbo",
                "implantacao",
                "memoria_calculo_permeabilidade",
                "quadro_areas_unidade",
                "quadro_areas_pavimento"
            ]:
                recorte = refinar_imagem_para_ocr(recorte, fator=2.0)
            else:
                # Aplica apenas redimensionamento e nitidez leve
                recorte = recorte.resize((recorte.width * 2, recorte.height * 2), Image.LANCZOS)
                from PIL import ImageEnhance
                recorte = ImageEnhance.Sharpness(recorte).enhance(2.0)

            print(f"📐 Tamanho do recorte '{classe}': {recorte.width}x{recorte.height}")


            caixas_detectadas.append({
                "classe": classe,
                "confianca": confianca,
                "bbox": [x1, y1, x2, y2]
            })

            if classe not in textos_por_classe:
                textos_por_classe[classe] = []

            usar_paddle = classe in [
                "quadro_areas_unidade",
                "quadro_areas_pavimento",
                "quadro_permeabilidade",
                "memoria_calculo_permeabilidade",
                "planta_baixa",
                "planta_primeiro_pavimento",
                "planta_situacao"
                "carimbo"
            ]

            if usar_paddle:
                linhas = extrair_linhas_paddle(recorte)
            else:
                linhas = extrair_linhas_tesseract(recorte)

            linhas = [
                re.sub(r"^nan\s*", "", l.strip(), flags=re.IGNORECASE)
                for l in linhas
                if isinstance(l, str) and len(l.strip()) > 3 and not re.match(r"^[\d\s]+$", l)
            ]

            if not linhas:
                print(f"⚠️ Nenhum texto detectado para {classe}")
            elif len(linhas) <= 2:
                print(f"⚠️ Texto escasso para {classe}: {linhas}")

            textos_por_classe[classe] = linhas

                # Garante que a pasta ainda existe antes de salvar o JSON
        os.makedirs(pasta_resultado, exist_ok=True)

        caminho_saida = os.path.join(pasta_resultado, "resultado_ocr.json")
        with open(caminho_saida, "w", encoding="utf-8") as f:
            json.dump({
                "caixas_detectadas": caixas_detectadas,
                "textos_extraidos": textos_por_classe,
                "analises_semanticas": analises_semanticas
            }, f, ensure_ascii=False, indent=2)

        print(f"✅ Extração finalizada. Arquivo salvo em {caminho_saida}")
        return JSONResponse(content={"id": id_resultado})

        print("✅ Extração finalizada. Arquivo salvo em resultado_ocr.json")
        return JSONResponse(content={"id": id_resultado})

    except Exception as e:
        print("❌ Erro durante a análise:", str(e))
        return JSONResponse(status_code=500, content={"erro": str(e)})

@router.get("/resultado/{id}")
async def obter_resultado(id: str):
    path = os.path.join(base_dir, "resultados", id, "resultado_ocr.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return JSONResponse(content=data)
    return JSONResponse(status_code=404, content={"erro": "Resultado não encontrado."})
