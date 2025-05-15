# classificar_risco.py

categorizacao_ambientes = {
    "crítico": {
        "condições": [
            "centro cirúrgico", "sala de cirurgia", "sala de parto",
            "lavabo cirúrgico", "sala de procedimentos invasivos",
            "cme", "sala de esterilização", "diálise", "uti", "curativo complexo"
        ],
        "instrucoes": [
            "Utilizar materiais laváveis, impermeáveis, resistentes a impacto e desinfetantes hospitalares.",
            "Instalar pisos com cantos arredondados e rodapés embutidos.",
            "Proibir ralos ou adotar modelos sifonados e selados.",
            "Exigir lavatórios com acionamento não manual (sensor, pé ou alavanca)."
        ]
    },
    "semicrítico": {
        "condições": [
            "consultório", "observação", "medicação",
            "coleta", "vacinação", "inalação",
            "sutura", "gesso", "pronto atendimento", "raio-x"
        ],
        "instrucoes": [
            "Materiais laváveis e de fácil higienização são obrigatórios.",
            "Lavatórios devem ter acionamento não manual sempre que possível.",
            "Ventilação natural ou mecânica com renovação de ar é recomendada.",
            "Ralos devem ser evitados, mas se presentes, devem ser sifonados e com tampa escamoteável."
        ]
    },
    "não crítico": {
        "condições": [
            "espera", "recepção", "administração",
            "reunião", "copa", "almoxarifado", "circulação", "vestiário", "sanitário"
        ],
        "instrucoes": [
            "Utilizar materiais resistentes, laváveis e de fácil manutenção.",
            "Manter boa ventilação e iluminação.",
            "Não há exigência para lavatórios com acionamento especial.",
            "Ralos permitidos apenas em áreas molhadas."
        ]
    }
}

def classificar_ambiente(nome: str):
    nome_lower = nome.strip().lower()
    for nivel, dados in categorizacao_ambientes.items():
        if any(cond in nome_lower for cond in dados["condições"]):
            return {
                "nome": nome,
                "risco": nivel.upper(),  # Retornar como RISCO MAIÚSCULO para exibição
                "instrucoes": dados["instrucoes"]
            }
    return {
        "nome": nome,
        "risco": "NÃO IDENTIFICADO",
        "instrucoes": ["Ambiente não identificado nas normas. Avaliação manual recomendada."]
    }

def classificar_ambientes_por_risco(ambientes):
    """
    Função integrada à API. Recebe lista de dicts com campo \"nome\".
    """
    resultado = []
    for item in ambientes:
        nome = item.get("nome", "")
        classificado = classificar_ambiente(nome)
        resultado.append({
            "nome": classificado["nome"],
            "risco": classificado["risco"]
        })
    return resultado

# Teste manual (opcional)
if __name__ == "__main__":
    ambientes_teste = [
        {"nome": "Sala de cirurgia"},
        {"nome": "Consultório odontológico"},
        {"nome": "Sala de espera"},
        {"nome": "Sala de coleta"},
        {"nome": "CME"},
        {"nome": "Vestiário"},
        {"nome": "Sala de Raio-X"},
        {"nome": "Administração"}
    ]

    resultados = classificar_ambientes_por_risco(ambientes_teste)
    for r in resultados:
        print(f"{r['nome']}: Risco {r['risco']}")
