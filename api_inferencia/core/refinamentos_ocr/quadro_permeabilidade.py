import re

def refinar_quadro_permeabilidade(linhas: list[str]) -> dict:
    """
    Refina os dados extraídos do quadro de permeabilidade.
    Retorna um dicionário com:
    - áreas individuais
    - área total
    - área do terreno
    - taxas de permeabilidade
    - conformidade com mínimo de 20%
    """
    areas = []
    area_terreno = None
    taxa_minima = None
    taxa_usada = None

    for linha in linhas:
        linha_lower = linha.lower()

        # Detecta áreas permeáveis: tolera erros de OCR e variações
        if re.search(r"área\s+permeável\s+\d+", linha_lower):
            match_valor = re.search(r"(\d+[.,]?\d*)\s?m[²º?]?", linha)
            match_tipo = re.search(r"-\s*([a-zA-Z]+)", linha)
            nome = re.search(r"(área permeável \d+)", linha, flags=re.IGNORECASE)

            if match_valor and nome:
                areas.append({
                    "nome": nome.group(1).strip().capitalize(),
                    "valor": match_valor.group(1).replace(",", ".") + " m²",
                    "tipo": match_tipo.group(1).lower() if match_tipo else "desconhecido"
                })

        # Área total permeável
        elif "área total" in linha_lower and "perme" in linha_lower:
            match = re.search(r"(\d+[.,]?\d*)", linha)
            if match:
                area_total = match.group(1).replace(",", ".")

        # Área do terreno
        elif "área do terreno" in linha_lower:
            match = re.search(r"(\d+[.,]?\d*)", linha)
            if match:
                area_terreno = match.group(1).replace(",", ".")

        # Taxa de permeabilidade mínima
        elif "taxa de permeabilidade mínima" in linha_lower:
            match = re.search(r"(\d+[.,]?\d*)", linha)
            if match:
                taxa_minima = match.group(1).replace(",", ".")

        # Taxa de permeabilidade usada
        elif "taxa de permeabilidade usada" in linha_lower:
            match = re.search(r"(\d+[.,]?\d*)", linha)
            if match:
                taxa_usada = match.group(1).replace(",", ".")

    return {
        "areas": areas,
        "area_terreno": area_terreno,
        "percentual_total": taxa_usada,
        "percentual_grama": taxa_usada if all("grama" in a["tipo"] for a in areas) else None,
        "conforme": float(taxa_usada or 0) >= float(taxa_minima or 20)
    }
