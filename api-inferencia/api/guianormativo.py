from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import unicodedata
from data.estabelecimentos_saude.classificadores.classificar_tipo_consultorio_odontologico import classificar_consultorio_odontologico
from data.estabelecimentos_saude.classificadores.classificar_risco import classificar_ambientes_por_risco

router = APIRouter()

class RequisicaoGuiaNormativo(BaseModel):
    tipo_projeto: str
    subtipo: Optional[str] = None
    usos: Optional[List[str]] = None
    ambientes: Optional[List[dict]] = None


def remover_acentos(texto: str) -> str:
    return unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')


@router.post("/api/guianormativo")
def gerar_guia_normativo(req: RequisicaoGuiaNormativo):
    relatorio = ""

    if req.tipo_projeto == "Estabelecimento de Saúde" and req.subtipo == "Consultório Odontológico" and req.ambientes:
        resultado = classificar_consultorio_odontologico(req.ambientes)

        relatorio += f"➞ {resultado['tipo_classificado']} detectado com {resultado['cadeiras_identificadas']} cadeira(s).\n"
        relatorio += f"- Raio-X: {'Sim' if resultado['tem_raiox'] else 'Não'}\n"
        relatorio += f"- CME: {'Sim' if resultado['tem_cme'] else 'Não'}\n"
        relatorio += f"- Laboratório: {'Sim' if resultado['tem_laboratorio'] else 'Não'}\n"

        if resultado.get("alertas"):
            relatorio += "\n⚠️ **Atenção:**\n"
            for alerta in resultado["alertas"]:
                relatorio += f"{alerta}\n"

        # Requisitos por ambiente (ambientes_obrigatorios e opcionais)
        caminho_json = os.path.join("data", "estabelecimentos_saude", "clinica_odontologica.json")
        if os.path.exists(caminho_json):
            with open(caminho_json, "r", encoding="utf-8") as f:
                dados = json.load(f)

            relatorio += "\n🏥 Exigências por Ambiente Obrigatório:\n"
            obrigatorios = dados.get("ambientes_obrigatorios", {}).get("consultorio_odontologico", [])
            for item in obrigatorios:
                relatorio += f"\n- {item['exigencia']} ({item['aplicacao']})\n  Norma: {item['norma']} | {item['referencia']}\n  Comentário: {item['comentario']}\n"

            relatorio += "\n➕ Ambientes Opcionais Recomendados:\n"
            opcionais = dados.get("opcionais_para_procedimentos", [])
            for item in opcionais:
                relatorio += f"\n- {item['exigencia']} ({item['aplicacao']})\n  Norma: {item['norma']} | {item['referencia']}\n  Comentário: {item['comentario']}\n"

            # Requisitos por tipo
            tipo_chave = resultado['tipo_classificado'].lower().replace(" ", "_")
            tipo_dados = dados.get("clinica_odontologica_por_tipo", {}).get(tipo_chave)
            if tipo_dados:
                relatorio += f"\n📌 Requisitos para {resultado['tipo_classificado']}: {tipo_dados.get('descricao', '')}\n"
                for item in tipo_dados.get("exigencias", []):
                    relatorio += f"\n- {item['exigencia']} ({item['aplicacao']})\n  Norma: {item['norma']} | {item['referencia']}\n  Comentário: {item['comentario']}\n"

        # Requisitos gerais universais
        caminho_requisitos = os.path.join("data", "estabelecimentos_saude", "requisitos_gerais_universais.json")
        if os.path.exists(caminho_requisitos):
            with open(caminho_requisitos, "r", encoding="utf-8") as f:
                gerais = json.load(f)
                regras = gerais.get("requisitos_gerais_universais", [])

                materiais = [r for r in regras if "Anexo 23" in r["norma"]]
                documentacao = [r for r in regras if r.get("categoria") == "documentacao"]
                dimensionamentos = [r for r in regras if r.get("categoria") == "dimensionamento"]

                relatorio += "\n🧱 Materiais por Classificação de Risco (Anexo 23):\n"
                for r in materiais:
                    relatorio += f"\n- {r['exigencia']} ({r['aplicacao']})\n  Norma: {r['norma']} | {r['referencia']}\n  Comentário: {r['comentario']}\n"

                relatorio += "\n📄 Documentação Exigida para Aprovação (Anexo 01 + 18):\n"
                for r in documentacao:
                    relatorio += f"\n- {r['exigencia']} ({r['aplicacao']})\n  Norma: {r['norma']} | {r['referencia']}\n  Comentário: {r['comentario']}\n"

                relatorio += "\n📐 Dimensionamentos Comuns (Anexo 01):\n"
                for r in dimensionamentos:
                    relatorio += f"\n- {r['exigencia']} ({r['aplicacao']})\n  Norma: {r['norma']} | {r['referencia']}\n  Comentário: {r['comentario']}\n"

        # Classificação de risco dos ambientes
        riscos = classificar_ambientes_por_risco(req.ambientes)
        relatorio += "\n⚖️ Classificação de Risco por Ambiente:\n"
        for item in riscos:
            relatorio += f"- {item['nome']}: Risco {item['risco']}\n"

        return {"relatorio": relatorio}

    return {"relatorio": "❌ Nenhum método de análise aplicável ao tipo informado."}
