from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image
from pdf2image import convert_from_bytes
import numpy as np
import pytesseract
import json
import io
import os
import uuid
import re
import requests
from core.modelo_yolo import model, base_dir
from core.ocr_utils import extrair_linhas_tesseract
from projeto_simplificado_PMI.quadros.quadro_permeabilidade import analisar_quadro_permeabilidade
from core.prompt_llama import montar_prompt

router = APIRouter()

@router.post("/inferir")
async def inferir_imagem(file: UploadFile = File(...)):
    try:
        print("📥 Arquivo recebido:", file.filename)
        contents = await file.read()

        if file.filename.lower().endswith(".pdf"):
            images = convert_from_bytes(contents, dpi=300, poppler_path="C:/poppler/bin")
            image = images[0]
        else:
            image = Image.open(io.BytesIO(contents)).convert("RGB")

        image_np = np.array(image)
        resultados = model.predict(image_np, conf=0.4, iou=0.5)

        textos_por_classe = {}
        caixas_detectadas = []

        for r in resultados:
            for box in r.boxes:
                classe = model.names[int(box.cls)]
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                recorte = image.crop((x1, y1, x2, y2))

                caixas_detectadas.append({
                    "classe": classe,
                    "confianca": float(box.conf),
                    "bbox": [x1, y1, x2, y2]
                })

                if classe not in textos_por_classe:
                    textos_por_classe[classe] = []

                if classe == "quadro_permeabilidade":
                    linhas = extrair_linhas_tesseract(recorte)
                    textos_por_classe[classe].extend(linhas)
                else:
                    texto_puro = pytesseract.image_to_string(recorte, lang="por")
                    textos_por_classe[classe].append(texto_puro)

        linhas_final = "\n".join(textos_por_classe.get("quadro_permeabilidade", []))
        prompt = montar_prompt(linhas_final)

        response_llama = requests.post("http://localhost:11434/api/generate", json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        })

        resposta = response_llama.json().get("response")
        json_match = re.search(r"\{[\s\S]+\}", resposta)
        resultado_estruturado = json.loads(json_match.group(0)) if json_match else {}

        resultado_analisado = analisar_quadro_permeabilidade(resultado_estruturado)

        id_resultado = str(uuid.uuid4())
        pasta_resultado = os.path.join(base_dir, "resultados", id_resultado)
        os.makedirs(pasta_resultado, exist_ok=True)

        with open(os.path.join(pasta_resultado, "resultado.json"), "w", encoding="utf-8") as f:
            json.dump({
                "caixas_detectadas": caixas_detectadas,
                "textos_estruturados": linhas_final,
                "estruturado_llama": resultado_estruturado,
                "analise": resultado_analisado
            }, f, ensure_ascii=False, indent=2)

        return JSONResponse(content={"id": id_resultado})

    except Exception as e:
        return JSONResponse(status_code=500, content={"erro": str(e)})

@router.get("/resultado/{id}")
async def obter_resultado(id: str):
    path = os.path.join(base_dir, "resultados", id, "resultado.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return JSONResponse(content=data)
    return JSONResponse(status_code=404, content={"erro": "Resultado não encontrado."})
