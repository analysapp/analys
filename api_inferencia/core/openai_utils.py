import os
import re
from openai import OpenAI
from dotenv import load_dotenv
print("✅ Módulo `openai_utils.py` carregado (usando API >= 1.0.0)")

# Carrega variáveis do .env
load_dotenv()

# Inicializa cliente com chave automática do ambiente
client = OpenAI()

# Modelos por tipo de quadro
MODELO_POR_CLASSE = {
    "carimbo": "gpt-3.5-turbo",
    "quadro_areas_pavimento": "gpt-3.5-turbo",
    "quadro_areas_unidade": "gpt-3.5-turbo",
    "quadro_permeabilidade": "gpt-3.5-turbo",
}

# Filtra e compacta texto OCR
def preparar_texto_ocr(linhas, max_linhas=20):
    filtradas = [
        l.strip()
        for l in linhas
        if len(l.strip()) > 5 and not re.search(r"(AutoCAD|Text|SHX|[.\-]{3,})", l, re.IGNORECASE)
    ]
    return "\n".join(filtradas[:max_linhas])

# Envia prompt para OpenAI com modelo por classe
def enviar_para_openai_por_classe(classe: str, prompt_base: str, linhas_ocr: list[str], max_tokens=1000) -> str:
    modelo = MODELO_POR_CLASSE.get(classe, "gpt-3.5-turbo")
    conteudo = preparar_texto_ocr(linhas_ocr)

    prompt = f"""{prompt_base}

Texto extraído (cada linha representa um item do OCR):
{conteudo}

Se algum campo estiver ausente ou ilegível, retorne "Não identificado".
Responda com apenas um JSON válido e sem comentários ou explicações adicionais.
"""

    try:
        response = client.chat.completions.create(
            model=modelo,
            messages=[
                {
                    "role": "system",
                    "content": "Você é um assistente técnico urbanístico que interpreta quadros técnicos extraídos de plantas arquitetônicas."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=max_tokens,
        )
        resultado = response.choices[0].message.content
        print(f"\n🧠 Resposta bruta do OpenAI ({classe}):\n{resultado}\n")
        return resultado

    except Exception as e:
        print(f"❌ Erro ao chamar OpenAI ({modelo}) para '{classe}':", str(e))
        return ""
