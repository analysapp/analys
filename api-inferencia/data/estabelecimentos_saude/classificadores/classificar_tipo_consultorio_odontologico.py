def classificar_consultorio_odontologico(ambientes):
    qtd_consultorios = 0
    tem_raiox = False
    tem_cme = False
    tem_lab = False

    for a in ambientes:
        nome = a.get("nome", "").lower()
        qtd = a.get("quantidade", 1)

        if "consultório" in nome:
            qtd_consultorios += qtd
        if "raio-x" in nome:
            tem_raiox = True
        if "cme" in nome or "esteriliz" in nome:
            tem_cme = True
        if "laboratório" in nome or "prótese" in nome:
            tem_lab = True

    tipo = ""
    alertas = []

    if qtd_consultorios <= 2:
        tipo = "Tipo II" if tem_raiox else "Tipo I"

    elif 3 <= qtd_consultorios <= 4:
        tipo = "Tipo IV" if tem_raiox else "Tipo III"

    elif qtd_consultorios > 4:
        if tem_raiox and tem_cme:
            tipo = "Tipo VI"
        elif not tem_raiox and tem_cme:
            tipo = "Tipo V"
        else:
            tipo = "Tipo indefinido"
            if not tem_cme:
                alertas.append("❗ CME (Central de Material Esterilizado) é obrigatória para clínicas com mais de 4 cadeiras.")
            if not tem_raiox:
                alertas.append("❗ Raio-X é exigido para clínicas do Tipo VI (mais de 4 cadeiras com diagnóstico por imagem).")

    return {
        "tipo_classificado": tipo,
        "cadeiras_identificadas": qtd_consultorios,
        "tem_raiox": tem_raiox,
        "tem_cme": tem_cme,
        "tem_laboratorio": tem_lab,
        "alertas": alertas
    }
