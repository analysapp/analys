import re

def limpar_ocr(textos_extraidos: dict) -> dict:
    """
    Limpa e filtra o dicionário de textos extraídos por OCR.

    - Remove caracteres invisíveis e aspas curvas
    - Remove trechos irrelevantes específicos por classe (ex: carimbo, implantação)
    - Mantém termos técnicos, medidas e palavras-chave úteis

    Args:
        textos_extraidos (dict): Dicionário com listas de strings por classe

    Returns:
        dict: Dicionário com textos limpos e úteis
    """

    # Padrões específicos a remover por classe
    padroes_excluir = {
        "carimbo": [
            "PARA USO DA PREFEITURA",
            "PREFEITURA MUNICIPAL DE ITAÚNA",
            "PROCESSO Nº DE / |",
            "Somos pela aprovação em /",
            "Analista",
            "Secretaria Municipal de Regulação Urbana",
            "PROJETO SIMPLIFICADO - DECRETO XXXXXXX",
            "Projeto simplificado aprovado",
            "respondem civil e administrativamente",
            "bem como normas técnicnas",
            "eventuais prejuízos a terceiros"
        ],
        "implantacao": [
            "QI L", "< Q A", "Õ mw «", "RT Ó mw", "cd | - uy", "LL] |<t ei", "Ss + LL] |<t",
            "T«< SA", "HH y LT <L", "25 o |2", "Tyfa! 7 À TS", "« N LI",
            "+ s vv + q", "E ON", "Ve vv. CC. E", "RR E O)",
            "\"w id + w ed w + vw (YX", "e Ee cv 4 +)", "CLT. 7, E", "TT E , 4 p, CLOÇIOO To)"
        ]
    }

    def linha_valida(linha: str, classe: str) -> bool:
        linha = linha.strip()
        if len(linha) < 4:
            return False

        # Remove se linha contém algum padrão irrelevante por classe
        padroes = padroes_excluir.get(classe, [])
        if any(p.lower() in linha.lower() for p in padroes):
            return False

        # Mantém números e símbolos isolados importantes
        if re.fullmatch(r"[\d\s,.:/-]+", linha):
            return True

        # Palavras-chave sensíveis que devem ser mantidas
        palavras_chave = [
            "área", "nível", "c.a", "ca ", "escala", "permeável",
            "proprietário", "responsável", "zoneamento",
            "bairro", "quadra", "lote", "uso", "planta", "uso", "título",
            "area", "permeav", "zona", "quadra", "lote", "zoneamento",
            "prancha", "número", "plano", "projeto",
            "0,", "1,", "2,", "3,", "4,", "5,", "6,", "7,", "8,", "9,",
            "0.", "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.",
            "m°", "m²", "m³", "m²/ha", "m²/m²", "/"
        ]
        if any(p in linha.lower() for p in palavras_chave):
            return True

        return True  # Assume que linha é útil se não for explicitamente irrelevante

    def limpar_linha(linha: str) -> str:
        return (
            linha.replace("\u200b", "")  # remove caracteres invisíveis
                 .replace("”", "\"")
                 .replace("“", "\"")
                 .strip()
        )

    # Aplica filtros por classe
    return {
        classe: [limpar_linha(l) for l in linhas if linha_valida(l, classe)]
        for classe, linhas in textos_extraidos.items()
        if linhas
    }