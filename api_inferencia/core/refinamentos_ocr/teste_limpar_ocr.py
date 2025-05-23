import sys
import os
import json

# Garante que o diretório raiz esteja no sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

# Importa a função de limpeza
from api_inferencia.core.refinamentos_ocr.limpar_ocr import limpar_ocr

# 🗂️ Caminho do resultado OCR bruto
id_resultado = "20efc1c2-d3ce-46d5-984a-6ad9d1812e35"
entrada = f"api_inferencia/resultados/{id_resultado}/resultado_ocr.json"
saida = f"api_inferencia/resultados/{id_resultado}/resultado_ocr_filtrado.json"

# 🔄 Carrega e limpa
with open(entrada, "r", encoding="utf-8") as f:
    dados = json.load(f)

textos_filtrados = limpar_ocr(dados["textos_extraidos"])

# 💾 Salva o novo JSON filtrado
with open(saida, "w", encoding="utf-8") as f:
    json.dump(textos_filtrados, f, ensure_ascii=False, indent=2)

print("✅ Arquivo gerado com sucesso:", saida)
