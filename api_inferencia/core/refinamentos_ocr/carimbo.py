import re

def analisar_carimbo(linhas: list[str]) -> dict:
    resultado = {
        "titulo_projeto": None,
        "bairro": None,
        "zona": None,
        "quadra": None,
        "lote": None,
        "zoneamento": None,
        "uso": None,
        "area_lote": None,
        "coeficiente_aproveitamento": None,
        "numero_prancha": None,
        "proprietario": None,
        "responsavel_tecnico": None
    }

    # Ignora tudo antes da linha que contém "bairro"
    inicio = 0
    for i, linha in enumerate(linhas):
        if "bairro" in linha.lower():
            inicio = i
            break
    linhas = linhas[inicio:]

    prox_responsavel = False
    prox_bairro_quadra = False

    for linha in linhas:
        linha = linha.replace("Õ", " ").replace("“", " ").replace("–", " ").replace("°", " ")
        linha = re.sub(r"\s{2,}", " ", linha)  # remove múltiplos espaços
        linha_lower = linha.lower()

        if prox_responsavel:
            resultado["responsavel_tecnico"] = linha.strip()
            prox_responsavel = False

        if "proprietário responsável técnico" in linha_lower:
            prox_responsavel = True

        # Captura bairro, quadra, lote, zoneamento em linha seguinte
        if prox_bairro_quadra:
            partes = linha.split()
            if len(partes) >= 5:
                resultado["bairro"] = partes[0]
                resultado["zona"] = partes[1]
                resultado["quadra"] = partes[2]
                resultado["lote"] = partes[3]
                resultado["zoneamento"] = partes[4]
            prox_bairro_quadra = False

        if "bairro zona quadra lote zoneamento" in linha_lower:
            prox_bairro_quadra = True

        # Captura título após expressão clara
        if not resultado["titulo_projeto"] and "título do projeto" in linha_lower:
            index = linhas.index(linha)
            if index + 1 < len(linhas):
                resultado["titulo_projeto"] = linhas[index + 1].strip()

        # 🔍 Nova detecção contínua por regex
        linha_continua = linha.replace(",", ".")

        # Área do lote
        match_area = re.search(r"(\d+[.,]\d+)\s*m²", linha_continua, re.IGNORECASE)
        if match_area:
            resultado["area_lote"] = match_area.group(1)

        # Uso logo após área
        match_uso = re.search(r"m²\s*([a-zA-Zçãéû]+)", linha_continua, re.IGNORECASE)
        if match_uso:
            resultado["uso"] = match_uso.group(1).upper()

        # C.A. como número depois do uso
        match_ca = re.search(r"m²\s*[a-zA-Zçãéû]+\s+(\d{1,3})\s", linha_continua)
        if match_ca:
            resultado["coeficiente_aproveitamento"] = match_ca.group(1)

        # Número da prancha com separadores / ou -
        match_prancha = re.search(r"\d{1,3}[/\\\-]\d{1,3}", linha_continua)
        if match_prancha:
            resultado["numero_prancha"] = match_prancha.group(0)

        # Redundantes (fallbacks)
        if not resultado["uso"] and "uso" in linha_lower:
            match = re.search(r"uso\s+([a-zçãéû\s]+)", linha_lower)
            if match:
                resultado["uso"] = match.group(1).strip()

        if not resultado["area_lote"] and re.search(r"\d+[,.]\d+\s*m²", linha_lower):
            match = re.search(r"(\d+[,.]\d+)\s*m²", linha_lower)
            if match:
                resultado["area_lote"] = match.group(1).replace(",", ".")

        if not resultado["coeficiente_aproveitamento"] and re.search(r"c[.]?a[.]?\s*[:=]?\s*\d+[,.]?\d*", linha_lower):
            match = re.search(r"\d+[,.]?\d*", linha_lower)
            if match:
                resultado["coeficiente_aproveitamento"] = match.group(0).replace(",", ".")

        if not resultado["numero_prancha"] and re.search(r"\d{1,3}[/\\\-]\d{1,3}", linha_lower):
            match = re.search(r"\d{1,3}[/\\\-]\d{1,3}", linha_lower)
            if match:
                resultado["numero_prancha"] = match.group(0)

        if not resultado["proprietario"] and "proprietário" in linha_lower:
            resultado["proprietario"] = linha.split(":")[-1].strip()

    return resultado
