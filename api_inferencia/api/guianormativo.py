from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import unicodedata
from fastapi.responses import HTMLResponse
from api_inferencia.data.estabelecimentos_saude.classificadores.classificar_tipo_consultorio_odontologico import classificar_consultorio_odontologico
from api_inferencia.data.estabelecimentos_saude.classificadores.classificar_risco import classificar_ambientes_por_risco

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
    tipo = remover_acentos(req.tipo_projeto or "").lower()
    subtipo = remover_acentos(req.subtipo or "").lower()

    relatorio = "<div class='font-dm text-[15px] leading-relaxed'>"

    if "estabelecimento" in tipo and "consultorio odontologico" in subtipo and req.ambientes:
        resultado = classificar_consultorio_odontologico(req.ambientes)

        relatorio += f"<h2 class='text-xl font-semibold'>Classificação Detectada</h2><ul>"
        relatorio += f"<li><strong>Tipo:</strong> {resultado['tipo_classificado']}</li>"
        relatorio += f"<li><strong>Cadeiras:</strong> {resultado['cadeiras_identificadas']}</li>"
        relatorio += f"<li><strong>Raio-X:</strong> {'Sim' if resultado['tem_raiox'] else 'Não'}</li>"
        relatorio += f"<li><strong>CME:</strong> {'Sim' if resultado['tem_cme'] else 'Não'}</li>"
        relatorio += f"<li><strong>Laboratório:</strong> {'Sim' if resultado['tem_laboratorio'] else 'Não'}</li>"
        relatorio += "</ul>"

        if resultado.get("alertas"):
            relatorio += "<h3 class='text-lg font-bold mt-6'>⚠️ Atenção</h3><ul>"
            for alerta in resultado["alertas"]:
                relatorio += f"<li>{alerta}</li>"
            relatorio += "</ul>"

        caminho_json = os.path.join("data", "estabelecimentos_saude", "clinica_odontologica.json")
        if os.path.exists(caminho_json):
            with open(caminho_json, "r", encoding="utf-8") as f:
                dados = json.load(f)

            tipo_chave = resultado['tipo_classificado'].lower().replace(" ", "_")
            todos_obrigatorios = dados.get("ambientes_obrigatorios", {}).get("consultorio_odontologico", [])
            obrigatorios_tipo = dados.get("clinica_odontologica_por_tipo", {}).get(tipo_chave, {}).get("exigencias", [])

            relatorio += "<h2 class='text-xl font-semibold mt-10'>🏥 Exigências Obrigatórias do Tipo Classificado</h2><ul>"
            for item in todos_obrigatorios:
                relatorio += f"<li><strong>{item['exigencia']}:</strong> {item['aplicacao']}<br><em>Norma:</em> {item['norma']} | <em>{item['referencia']}</em><br><em>Comentário:</em> {item['comentario']}</li>"
            relatorio += "</ul>"

            if obrigatorios_tipo:
                relatorio += f"<h2 class='text-xl font-semibold mt-10'>📌 Exigências Específicas para {resultado['tipo_classificado']}</h2><ul>"
                for item in obrigatorios_tipo:
                    relatorio += f"<li><strong>{item['exigencia']}:</strong> {item['aplicacao']}<br><em>Norma:</em> {item['norma']} | <em>{item['referencia']}</em><br><em>Comentário:</em> {item['comentario']}</li>"
                relatorio += "</ul>"

            relatorio += "<h2 class='text-xl font-semibold mt-10'>➕ Ambientes Opcionais Recomendados</h2><ul>"
            opcionais = dados.get("opcionais_para_procedimentos", [])
            for item in opcionais:
                relatorio += f"<li><strong>{item['exigencia']}:</strong> {item['aplicacao']}<br><em>Norma:</em> {item['norma']} | <em>{item['referencia']}</em><br><em>Comentário:</em> {item['comentario']}</li>"
            relatorio += "</ul>"

            # Normas específicas se usuário marcou Sala de Raio-X
            if any('raio' in a.get('nome', '').lower() for a in req.ambientes):
                raiox_normas = dados.get("normas_raiox", [])
                if raiox_normas:
                    relatorio += "<h2 class='text-xl font-semibold mt-10'>🩻 Normas Específicas para Sala de Raio-X</h2><ul>"
                    for item in raiox_normas:
                        relatorio += f"<li><strong>{item['exigencia']}:</strong> {item['aplicacao']}<br><em>Norma:</em> {item['norma']} | <em>{item['referencia']}</em><br><em>Comentário:</em> {item['comentario']}</li>"
                    relatorio += "</ul>"

        caminho_requisitos = os.path.join("data", "estabelecimentos_saude", "requisitos_gerais_universais.json")
        if os.path.exists(caminho_requisitos):
            with open(caminho_requisitos, "r", encoding="utf-8") as f:
                gerais = json.load(f)
                regras = gerais.get("requisitos_gerais_universais", [])

                materiais = [r for r in regras if "Anexo 23" in r["norma"]]
                documentacao = [r for r in regras if r.get("categoria") == "documentacao"]
                dimensionamentos = [r for r in regras if r.get("categoria") == "dimensionamento"]

                relatorio += "<h2 class='text-xl font-semibold mt-10'>🧱 Materiais por Classificação de Risco (Anexo 23)</h2><ul>"
                for r in materiais:
                    relatorio += f"<li><strong>{r['exigencia']}:</strong> {r['aplicacao']}<br><em>Norma:</em> {r['norma']} | <em>{r['referencia']}</em><br><em>Comentário:</em> {r['comentario']}</li>"
                relatorio += "</ul>"

                relatorio += "<h2 class='text-xl font-semibold mt-10'>📄 Documentação Exigida para Aprovação (Anexo 01 + 18)</h2><ul>"
                for r in documentacao:
                    relatorio += f"<li><strong>{r['exigencia']}:</strong> {r['aplicacao']}<br><em>Norma:</em> {r['norma']} | <em>{r['referencia']}</em><br><em>Comentário:</em> {r['comentario']}</li>"
                relatorio += "</ul>"

                relatorio += "<h2 class='text-xl font-semibold mt-10'>📐 Dimensionamentos Comuns (Anexo 01)</h2><ul>"
                for r in dimensionamentos:
                    relatorio += f"<li><strong>{r['exigencia']}:</strong> {r['aplicacao']}<br><em>Norma:</em> {r['norma']} | <em>{r['referencia']}</em><br><em>Comentário:</em> {r['comentario']}</li>"
                relatorio += "</ul>"

        riscos = classificar_ambientes_por_risco(req.ambientes)
        relatorio += "<h2 class='text-xl font-semibold mt-10'>⚖️ Classificação de Risco por Ambiente</h2><ul>"
        for item in riscos:
            relatorio += f"<li>{item['nome']}: Risco {item['risco']}</li>"
        relatorio += "</ul></div>"

        return HTMLResponse(content=relatorio)

    return HTMLResponse(content="<div class='text-red-600 font-semibold'>❌ Nenhum método de análise aplicável ao tipo informado.</div>")
