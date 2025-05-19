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
from core.prompt_llama import (
    montar_prompt,
    montar_prompt_carimbo,
    montar_prompt_quadro_areas_unidade,
    montar_prompt_quadro_areas_pavimento
)

router = APIRouter()
def validar_dados_carimbo(dados: dict) -> dict:
    def is_nome_valido(texto):
        return bool(re.search(r"[A-Za-z]{2,}", texto)) and not texto.lower() in [
            "proprietário", "responsável técnico", "bairro", "zoneamento", "zona", "lote", "quadra", "uso"
        ]

    def is_numero(texto):
        return re.fullmatch(r"\d{1,3}", texto) is not None

    def is_lote(texto):
        return re.fullmatch(r"\d{1,3}[A-Za-z]?", texto) is not None

    def is_area(texto):
        return re.fullmatch(r"\d{1,4},\d{2} m²", texto) is not None

    def is_zoneamento(texto):
        return re.fullmatch(r"[A-Za-z]{2,3}\d?", texto) is not None

    def is_ca(texto):
        return re.fullmatch(r"\d{1},\d{2}", texto) is not None

    def is_prancha(texto):
        return re.fullmatch(r"\d{1,2}/\d{1,2}", texto) is not None

    dados_corrigidos = dados.copy()

    if not is_nome_valido(dados_corrigidos.get("bairro", "")):
        dados_corrigidos["bairro"] = "Não identificado"
    if not is_numero(dados_corrigidos.get("zona", "")):
        dados_corrigidos["zona"] = "Não identificado"
    if not is_numero(dados_corrigidos.get("quadra", "")):
        dados_corrigidos["quadra"] = "Não identificado"
    if not is_lote(dados_corrigidos.get("lote", "")):
        dados_corrigidos["lote"] = "Não identificado"
    if not is_zoneamento(dados_corrigidos.get("zoneamento", "")):
        dados_corrigidos["zoneamento"] = "Não identificado"

    for campo in ["area_do_lote", "area_construida", "area_existente", "area_demolida"]:
        if not is_area(dados_corrigidos.get(campo, "")):
            dados_corrigidos[campo] = "Não identificado"

    if not is_nome_valido(dados_corrigidos.get("uso", "")):
        dados_corrigidos["uso"] = "Não identificado"

    if not is_ca(dados_corrigidos.get("coeficiente_de_aproveitamento", "")):
        dados_corrigidos["coeficiente_de_aproveitamento"] = "Não identificado"

    if not is_prancha(dados_corrigidos.get("numero_da_prancha", "")):
        dados_corrigidos["numero_da_prancha"] = "Não identificado"

    if not is_nome_valido(dados_corrigidos.get("proprietario", "")):
        dados_corrigidos["proprietario"] = "Não identificado"

    if not is_nome_valido(dados_corrigidos.get("responsavel_tecnico", "")):
        dados_corrigidos["responsavel_tecnico"] = "Não identificado"

    return dados_corrigidos

def refinar_carimbo(linhas):
    dados = []
    capturar = False
    ignorar = ["prefeitura", "secretaria", "visto", "processo", "responda", "legisla", "norma", "aprova", "técnico"]
    campos = {
        "bairro": None,
        "zona": None,
        "quadra": None,
        "lote": None,
        "zoneamento": None,
        "uso": None,
        "area_do_lote": None,
        "coeficiente": None,
        "prancha": None,
        "proprietario": None,
        "responsavel": None
    }

    for i, linha in enumerate(linhas):
        l = linha.strip()
        l_upper = l.upper()

        if any(p in l.lower() for p in ignorar):
            continue
        if "BAIRRO" in l_upper:
            capturar = True
        if not capturar:
            continue

        # Agrupamento típico em linha anterior (ex: "BAIRRO ZONA LOTE ZONEAMENTO")
        if re.search(r"BAIRRO.*ZONA.*LOTE.*ZONEAMENTO", l_upper):
            valores = linhas[i + 1].strip().split()
            if len(valores) >= 5:
                campos["bairro"] = valores[0]
                campos["zona"] = valores[1]
                campos["quadra"] = valores[2]
                campos["lote"] = valores[3]
                campos["zoneamento"] = valores[4]
            continue

        if "USO" in l_upper and campos["uso"] is None:
            campos["uso"] = l.split(":")[-1].strip()

        elif "ÁREA DO LOTE" in l_upper and campos["area_do_lote"] is None:
            match = re.search(r"\d{2,4}[.,]\d{2}", l)
            if match:
                campos["area_do_lote"] = match.group(0).replace(".", ",") + " m²"

        elif "C.A" in l_upper and campos["coeficiente"] is None:
            match = re.search(r"(\d{1}[.,]\d{1,2})", l)
            if match:
                campos["coeficiente"] = match.group(1).replace(".", ",")

        elif "PRANCHA" in l_upper and campos["prancha"] is None:
            match = re.search(r"(\d{1,2}/\d{1,2})", l)
            if match:
                campos["prancha"] = match.group(1)

        elif "PROPRIET" in l_upper and campos["proprietario"] is None:
            extraido = l.split(":")[-1].strip()
            if extraido and "proprietário" not in extraido.lower():
                campos["proprietario"] = extraido

        elif "RESPONS" in l_upper and campos["responsavel"] is None:
            extraido = l.split(":")[-1].strip()
            if extraido and "responsável" not in extraido.lower():
                campos["responsavel"] = extraido

        # Captura valores individuais se ainda não foram preenchidos
        elif "BAIRRO" in l_upper and campos["bairro"] is None:
            campos["bairro"] = l.split("BAIRRO")[-1].strip()
        elif "ZONA" in l_upper and campos["zona"] is None:
            campos["zona"] = l.split("ZONA")[-1].strip()
        elif "QUADRA" in l_upper and campos["quadra"] is None:
            campos["quadra"] = l.split("QUADRA")[-1].strip()
        elif "LOTE" in l_upper and campos["lote"] is None:
            campos["lote"] = l.split("LOTE")[-1].strip()
        elif "ZONEAMENTO" in l_upper and campos["zoneamento"] is None:
            campos["zoneamento"] = l.split("ZONEAMENTO")[-1].strip()

    # Geração final dos dados limpos
    if campos["bairro"]: dados.append(f"Bairro: {campos['bairro']}")
    if campos["zona"]: dados.append(f"Zona: {campos['zona']}")
    if campos["quadra"]: dados.append(f"Quadra: {campos['quadra']}")
    if campos["lote"]: dados.append(f"Lote: {campos['lote']}")
    if campos["zoneamento"]: dados.append(f"Zoneamento: {campos['zoneamento']}")
    if campos["uso"]: dados.append(f"Uso: {campos['uso']}")
    if campos["area_do_lote"]: dados.append(f"Área do lote: {campos['area_do_lote']}")
    if campos["coeficiente"]: dados.append(f"C.A.: {campos['coeficiente']}")
    if campos["prancha"]: dados.append(f"Nº Prancha: {campos['prancha']}")
    if campos["proprietario"]: dados.append(f"Proprietário: {campos['proprietario']}")
    if campos["responsavel"]: dados.append(f"Responsável técnico: {campos['responsavel']}")

    return dados


def normalizar_texto_ocr(classe, linhas):
    if classe == "carimbo":
        return refinar_carimbo(linhas)
    elif classe.startswith("quadro_areas"):
        return [
            linha.strip()
            for linha in linhas
            if any(p in linha.upper() for p in ["CASA", "TOTAL", "PAVIMENTO", "M²", "ÁREA"])
        ]
    elif classe == "quadro_permeabilidade":
        return linhas
    else:
        return linhas

@router.post("/inferir")
async def inferir_imagem(file: UploadFile = File(...)):
    try:
        print("📥 Arquivo recebido:", file.filename)
        contents = await file.read()

        id_resultado = str(uuid.uuid4())
        pasta_resultado = os.path.join(base_dir, "resultados", id_resultado)
        os.makedirs(pasta_resultado, exist_ok=True)

        # Criação inicial do status.json para o frontend não retornar 404
        with open(os.path.join(pasta_resultado, "status.json"), "w", encoding="utf-8") as f:
                json.dump({"etapa": 1}, f)

        def atualizar_status(etapa: int):
            with open(os.path.join(pasta_resultado, "status.json"), "w", encoding="utf-8") as f:
             json.dump({"etapa": etapa}, f)

        atualizar_status(1)

        print("📄 Convertendo imagem/PDF...")
        image = Image.open(io.BytesIO(contents)).convert("RGB") if not file.filename.lower().endswith(".pdf") \
            else convert_from_bytes(contents, dpi=300, poppler_path="C:/poppler/bin")[0]

        atualizar_status(2)

        print("🔍 Rodando inferência com YOLOv8...")
        image_np = np.array(image)
        resultados = model.predict(image_np, conf=0.4, iou=0.5)

        atualizar_status(3)

        textos_por_classe = {}
        caixas_detectadas = []

        quadros_ocr_linha = [
            "quadro_permeabilidade", "carimbo",
            "quadro_areas_unidade", "quadro_areas_pavimento"
        ]
        demais_recortes_textuais = [
            "planta_baixa", "corte_esquematico",
            "memorial_area_permeavel", "implantacao"
        ]

        print("✂️ Recortando quadros e executando OCR...")
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

                linhas = extrair_linhas_tesseract(recorte)
                if classe in quadros_ocr_linha:
                    print(f"🧠 Estruturando quadro: {classe}")
                    linhas_normalizadas = normalizar_texto_ocr(classe, linhas)
                    textos_por_classe[classe] = linhas_normalizadas
                elif classe in demais_recortes_textuais:
                    print(f"📝 Extraindo texto livre: {classe}")
                    textos_por_classe[classe] = linhas

        atualizar_status(4)

        print("📤 Enviando quadros para LLaMA...")
        resposta_llama_total = {}

        if "quadro_permeabilidade" in textos_por_classe:
            prompt = montar_prompt("\n".join(textos_por_classe["quadro_permeabilidade"]))
            r = requests.post("http://localhost:11434/api/generate", json={"model": "mistral", "prompt": prompt, "stream": False})
            j = r.json().get("response")
            match = re.search(r"\{[\s\S]+\}", j)
            if match:
                resposta_llama_total["quadro_permeabilidade"] = json.loads(match.group(0))
                # Calcular soma_areas e area_total se possível
                quadro = resposta_llama_total["quadro_permeabilidade"]
                soma_areas = 0
                area_total = 0
                if isinstance(quadro, dict):
                    # Exemplo: espera-se que quadro tenha uma lista de áreas e um campo total
                    if "areas" in quadro and isinstance(quadro["areas"], list):
                        soma_areas = sum(a.get("area", 0) for a in quadro["areas"] if isinstance(a, dict) and "area" in a)
                    if "area_total" in quadro:
                        area_total = quadro["area_total"]
                if abs(soma_areas - area_total) > 0.5:
                    print("⚠️ Inconsistência no total das áreas permeáveis")


        if "carimbo" in textos_por_classe:
            prompt = montar_prompt_carimbo("\n".join(textos_por_classe["carimbo"]))
            r = requests.post("http://localhost:11434/api/generate", json={"model": "mistral", "prompt": prompt, "stream": False})
            j = r.json().get("response")
            match = re.search(r"\{[\s\S]+\}", j)
            if match:
              resultado_bruto = json.loads(match.group(0))
              resposta_llama_total["carimbo"] = validar_dados_carimbo(resultado_bruto)


        if "quadro_areas_unidade" in textos_por_classe:
            try:
                prompt = montar_prompt_quadro_areas_unidade("\n".join(textos_por_classe["quadro_areas_unidade"]))
                r = requests.post("http://localhost:11434/api/generate", json={"model": "mistral", "prompt": prompt, "stream": False})
                j = r.json().get("response", "")
                match = re.search(r"\[.*?\]", j, re.DOTALL)
                if match:
                    resposta_llama_total["quadro_areas_unidade"] = json.loads(match.group(0))
                else:
                    resposta_llama_total["quadro_areas_unidade"] = []
                    print("⚠️ Nenhum JSON válido encontrado no quadro_areas_unidade.")
            except Exception as e:
                resposta_llama_total["quadro_areas_unidade"] = []
                print("❌ Erro durante a inferência do quadro_areas_unidade:", str(e))

        if "quadro_areas_pavimento" in textos_por_classe:
            prompt = montar_prompt_quadro_areas_pavimento("\n".join(textos_por_classe["quadro_areas_pavimento"]))
            r = requests.post("http://localhost:11434/api/generate", json={"model": "mistral", "prompt": prompt, "stream": False})
            j = r.json().get("response")
            match = re.search(r"\[.*\]", j, re.DOTALL)
            if match:
                resposta_llama_total["quadro_areas_pavimento"] = json.loads(match.group(0))
            for pav in resposta_llama_total["quadro_areas_pavimento"]:
                if pav.get("total") != pav.get("subtotal"):
                    print(f"⚠️ Verifique inconsistência no pavimento {pav.get('pavimento')}")


        atualizar_status(5)

        print("📊 Analisando resultado com regras...")
        resultado_analisado = {}
        if "quadro_permeabilidade" in resposta_llama_total:
            resultado_analisado = analisar_quadro_permeabilidade(resposta_llama_total["quadro_permeabilidade"])

        print("💾 Salvando resultado final...")
        with open(os.path.join(pasta_resultado, "resultado.json"), "w", encoding="utf-8") as f:
            json.dump({
                "caixas_detectadas": caixas_detectadas,
                "textos_estruturados": textos_por_classe,
                "estruturado_llama": resposta_llama_total,
                "analise": resultado_analisado
            }, f, ensure_ascii=False, indent=2)

        atualizar_status(6)
        print("✅ Análise finalizada com sucesso.")
        return JSONResponse(content={"id": id_resultado})

    except Exception as e:
        print("❌ Erro durante a análise:", str(e))
        return JSONResponse(status_code=500, content={"erro": str(e)})

@router.get("/resultado/{id}")
async def obter_resultado(id: str):
    path = os.path.join(base_dir, "resultados", id, "resultado.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return JSONResponse(content=data)
    return JSONResponse(status_code=404, content={"erro": "Resultado não encontrado."})
