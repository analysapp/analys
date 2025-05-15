import re

def analisar_quadro_permeabilidade(dados_llama: dict) -> dict:
    """
    Recebe os dados estruturados pela LLaMA e calcula:
    - área total do terreno
    - área permeável somada
    - taxa de permeabilidade total
    - taxa de grama
    - conformidade (percentual_total >= 20%)
    """
    try:
        # 1. Lista de áreas individuais
        areas = dados_llama.get("areas", [])  # Ex: [{ nome, valor, tipo }]
        area_terreno = dados_llama.get("area_terreno", "")
        percentual_total = dados_llama.get("percentual_total", "")
        percentual_grama = dados_llama.get("percentual_grama", "")

        # Converte os valores extraídos (que vêm como "123,45 m²" ou "25,5%") para float
        def para_float(texto):
            try:
                texto = texto.replace(",", ".")
                texto = re.sub(r"[^\d.]", "", texto)
                return round(float(texto), 2)
            except:
                return 0.0

        terreno_m2 = para_float(area_terreno)
        perc_total = para_float(percentual_total)
        perc_grama = para_float(percentual_grama)

        soma_permeavel = 0.0
        soma_grama = 0.0
        lista_areas_formatada = []

        for item in areas:
            nome = item.get("nome", "")
            tipo = item.get("tipo", "").lower()
            valor_str = item.get("valor", "")
            valor = para_float(valor_str)

            if valor == 0.0:
                continue

            # Soma todas as áreas
            soma_permeavel += valor

            # Soma apenas gramas
            if "grama" in tipo or "gramado" in tipo:
                soma_grama += valor

            # Mantém lista original formatada
            lista_areas_formatada.append({
                "nome": nome,
                "tipo": tipo,
                "valor": f"{valor:.2f} m²"
            })

        # Recalcula percentual grama
        perc_grama_calc = (soma_grama / soma_permeavel * 100) if soma_permeavel > 0 else 0

        return {
            "area_terreno": f"{terreno_m2:.2f} m²",
            "area_permeavel_total": f"{soma_permeavel:.2f} m²",
            "percentual_total": f"{perc_total:.2f}%",
            "percentual_grama": f"{perc_grama_calc:.2f}%",
            "conforme": perc_total >= 20,
            "areas_encontradas": lista_areas_formatada
        }

    except Exception as e:
        return {"erro": f"Erro ao analisar quadro: {str(e)}"}
