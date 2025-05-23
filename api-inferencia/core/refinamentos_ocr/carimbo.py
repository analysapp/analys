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
        linha = linha.replace("Õ", " ").replace("“", " ").replace("–", " ")
        linha_lower = linha.lower()

        if prox_responsavel:
            resultado["responsavel_tecnico"] = linha.strip()
            prox_responsavel = False

        if "proprietário responsável técnico" in linha_lower:
            prox_responsavel = True

        # Captura bairro, quadra, lote, zoneamento em linha seguinte
        if prox_bairro_quadra:
            partes = linha.split()
            if len(partes) >= 4:
                resultado["bairro"] = partes[0]
                resultado["quadra"] = partes[1]
                resultado["lote"] = partes[2]
                resultado["zoneamento"] = partes[3]
            prox_bairro_quadra = False

        if "bairro quadra lote zoneamento" in linha_lower:
            prox_bairro_quadra = True

        # Captura título
        if not resultado["titulo_projeto"] and any(t in linha_lower for t in ["projeto", "plano"]):
            resultado["titulo_projeto"] = linha.strip()

        # Detecta linha que contém área, uso, ca, prancha agrupados
        if re.search(r"\d+[,.]\d+\s*m\u00b2.*\d", linha_lower):
            partes = linha.split()
            for i, p in enumerate(partes):
                # Área do lote
                if "m²" in p and i > 0:
                    resultado["area_lote"] = partes[i - 1].replace(",", ".")
                    # Uso após área
                    if i + 1 < len(partes):
                        uso_candidato = partes[i + 1]
                        if uso_candidato.isalpha():
                            resultado["uso"] = uso_candidato.upper()
                # Coeficiente de Aproveitamento
                if re.fullmatch(r"\d+[,.]?\d*", p):
                    valor = p.replace(",", ".")
                    if not resultado["coeficiente_aproveitamento"]:
                        resultado["coeficiente_aproveitamento"] = valor
                # Número da prancha (formato 01/01, 02-05, até separados)
                if i + 2 < len(partes):
                    candidato = f"{partes[i]}/{partes[i+2]}"
                    if re.fullmatch(r"\d{1,3}[/\\-]\d{1,3}", candidato):
                        resultado["numero_prancha"] = candidato

        # Redundantes (fallback)
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

        if not resultado["numero_prancha"] and re.search(r"\d{1,3}[/\\-]\d{1,3}", linha_lower):
            match = re.search(r"\d{1,3}[/\\-]\d{1,3}", linha_lower)
            if match:
                resultado["numero_prancha"] = match.group(0)

        if not resultado["proprietario"] and "proprietário" in linha_lower:
            resultado["proprietario"] = linha.split(":")[-1].strip()

    return resultado
