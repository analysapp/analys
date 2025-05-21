# core/prompt_modelos.py

def montar_prompt_carimbo() -> str:
    return """
Você deve interpretar os dados extraídos do carimbo de um projeto arquitetônico.

Preencha os seguintes campos obrigatórios em formato JSON:
- bairro
- zona
- quadra
- lote
- zoneamento
- área do lote
- uso
- coeficiente de aproveitamento
- número da prancha
- proprietário
- responsável técnico

Se algum campo não estiver presente ou não puder ser identificado, utilize "Não identificado".

Retorne **apenas** um objeto JSON. Nenhum comentário ou texto adicional deve ser incluído.
"""

def montar_prompt_quadro_areas_pavimento() -> str:
    return """
Você deve interpretar o quadro de áreas por pavimento extraído de um projeto arquitetônico.

Para cada pavimento identificado, retorne os seguintes campos:
- pavimento (ex: "Pavimento Térreo")
- existente (em m²)
- a_construir (em m²)
- a_demolir (em m²)
- subtotal (em m²)
- total (em m²)

Ignore linhas que contenham apenas a palavra "TOTAL" ou "GERAL".  
Se não houver algum valor, utilize "0.00 m²" ou "Não identificado".

Retorne um array JSON com um objeto por pavimento. Não inclua comentários ou texto adicional.
"""

def montar_prompt_quadro_areas_unidade() -> str:
    return """
Você deve interpretar o quadro de áreas por unidade (ex: apartamentos) extraído de um projeto arquitetônico.

Para cada unidade identificada, retorne:
- nome da unidade (ex: "Apartamento 101")
- área privativa (em m²)
- área comum (em m²)
- área total (em m²)
- vagas de garagem (número)

Considere apenas linhas que contenham nomes de apartamentos e valores em m².  
Ignore linhas com cabeçalhos, totalizações ou repetição de campos.

Retorne um array JSON com um objeto por unidade. Nenhum comentário deve ser incluído.
"""

def montar_prompt() -> str:
    return """
Você deve interpretar o quadro de permeabilidade extraído de um projeto arquitetônico.

Retorne os seguintes dados em formato JSON:
- Uma lista de áreas permeáveis encontradas com:
  - nome da área (ex: "Área permeável 01")
  - valor (em m², com 2 casas decimais)
- Soma total das áreas permeáveis
- Área total do lote (se presente)
- Percentual de permeabilidade obtido (calculado ou extraído)
- Percentual mínimo exigido (se informado)

Se algum dado estiver ausente, utilize "Não identificado".

Retorne apenas um objeto JSON. Não inclua explicações, comentários ou quebras de linha fora do JSON.
"""
