import pytesseract

def extrair_linhas_tesseract(image_pil):
    dados = pytesseract.image_to_data(image_pil, lang="por", output_type=pytesseract.Output.DICT)
    palavras = []
    for i in range(len(dados["text"])):
        texto = dados["text"][i].strip()
        if texto:
            palavras.append({
                "text": texto,
                "left": dados["left"][i],
                "top": dados["top"][i],
                "width": dados["width"][i],
                "height": dados["height"][i],
            })

    linhas = []
    palavras.sort(key=lambda x: x["top"])
    for palavra in palavras:
        y = palavra["top"]
        for linha in linhas:
            if abs(linha["y"] - y) <= 10:
                linha["palavras"].append(palavra)
                break
        else:
            linhas.append({"y": y, "palavras": [palavra]})

    return [" ".join(p["text"] for p in sorted(linha["palavras"], key=lambda x: x["left"])) for linha in linhas]
