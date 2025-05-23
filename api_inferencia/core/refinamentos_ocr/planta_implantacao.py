import re

def analisar_implantacao(linhas: list[str]) -> dict:
    resultado = {
        "tem_rebaixo_meio_fio": False,
        "tem_acesso_pedestres": False,
        "tem_acesso_veiculos": False,
        "tipo_projeto_detectado": None,
        "areas_permeaveis": [],
        "fechamentos_divisa": [],
        "escala": None
    }

    for linha in linhas:
        linha_lower = linha.lower()

        # Detecta termos relacionados a rebaixo
        if re.search(r"rebaixo.*meio[- ]?fio", linha_lower):
            resultado["tem_rebaixo_meio_fio"] = True

        # Detecta acessos
        if "acesso de pedestres" in linha_lower or "acesso pedestre" in linha_lower:
            resultado["tem_acesso_pedestres"] = True
        if "acesso de veiculos" in linha_lower or "acesso veicular" in linha_lower:
            resultado["tem_acesso_veiculos"] = True

        # Detecta tipo de projeto
        if "habitação unifamiliar" in linha_lower:
            resultado["tipo_projeto_detectado"] = "habitação unifamiliar"
        elif "habitação multifamiliar" in linha_lower:
            resultado["tipo_projeto_detectado"] = "habitação multifamiliar"
        elif "comercial" in linha_lower:
            resultado["tipo_projeto_detectado"] = "comercial"
        elif "pavimento" in linha_lower and not resultado["tipo_projeto_detectado"]:
            resultado["tipo_projeto_detectado"] = "possivelmente vertical"

        # Detecta áreas permeáveis
        if re.search(r"área permeável.*", linha_lower):
            resultado["areas_permeaveis"].append(linha.strip())

        # Detecta fechamentos de divisa
        if re.search(r"(muro|cerca viva|cerca|fechamento em tela).*h[=:]?\s*\d+(,\d+)?", linha_lower):
            resultado["fechamentos_divisa"].append(linha.strip())

        # Detecta escala
        match = re.search(r"esc(?:ala)?[:\s]+(\d+[:/\-]\d+)", linha_lower)
        if match:
            resultado["escala"] = match.group(1)

    return resultado
