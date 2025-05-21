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

    # Ignora tudo antes do título do projeto
    inicio = 0
    for i, linha in enumerate(linhas):
        if "título do projeto" in linha.lower():
            inicio = i
            break
    linhas = linhas[inicio:]

    prox_responsavel = False

    for linha in linhas:
        linha_lower = linha.lower()

        if prox_responsavel:
            resultado["responsavel_tecnico"] = linha.strip()
            prox_responsavel = False

        if "proprietário responsável técnico" in linha_lower:
            prox_responsavel = True

        if not resultado["bairro"] and "bairro quadra lote zoneamento" in linha_lower:
            partes = linha.split()
            if len(partes) >= 5:
                resultado["bairro"] = partes[1]
                resultado["quadra"] = partes[2]
                resultado["lote"] = partes[3]
                resultado["zoneamento"] = partes[4]

        if not resultado["uso"] and "uso" in linha_lower:
            match = re.search(r"uso\s+([a-zçãéû\s]+)", linha_lower)
            if match:
                resultado["uso"] = match.group(1).strip()

        if not resultado["area_lote"] and re.search(r"\d+[,.]\d+\s*m\u00b2", linha_lower):
            match = re.search(r"(\d+[,.]\d+)\s*m\u00b2", linha_lower)
            if match:
                resultado["area_lote"] = match.group(1).replace(",", ".")

        if not resultado["coeficiente_aproveitamento"] and re.search(r"c[.]?a[.]?\s*[:=]?\s*\d+[,.]?\d*", linha_lower):
            match = re.search(r"\d+[,.]?\d*", linha_lower)
            if match:
                resultado["coeficiente_aproveitamento"] = match.group(0).replace(",", ".")

        if not resultado["numero_prancha"] and re.search(r"prancha\s*\d+", linha_lower):
            match = re.search(r"\d+", linha_lower)
            if match:
                resultado["numero_prancha"] = match.group(0)

        if not resultado["proprietario"] and "proprietário" in linha_lower:
            resultado["proprietario"] = linha.split(":")[-1].strip()

        if not resultado["titulo_projeto"] and any(t in linha_lower for t in ["projeto", "plano"]):
            resultado["titulo_projeto"] = linha.strip()

    return resultado
