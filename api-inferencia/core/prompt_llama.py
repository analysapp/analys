def montar_prompt(linhas_final: str) -> str:
    return f"""
Você é um assistente técnico urbanístico responsável por interpretar quadros de permeabilidade extraídos de projetos arquitetônicos. 
O texto abaixo foi extraído por OCR (reconhecimento óptico de caracteres) e pode conter erros, como:

- Palavras e números embaralhados na mesma linha
- Separação incorreta de valores
- Quebra de estrutura visual original

...

Seu papel é:

1. Organizar os dados em forma de **quadro de áreas** (como se fosse uma tabela, mesmo em texto).
2. Liste individualmente todas as áreas permeáveis encontradas com seus respectivos valores.
3. Depois disso, calcule os dados e retorne um JSON limpo com os campos especificados abaixo.

---

📌 Campos obrigatórios no JSON de saída:

1. Liste individualmente todas as áreas permeáveis encontradas no texto extraído, com os seguintes campos para cada uma:
   - nome da área (ex: "Área permeável 01")
   - valor (com 2 casas decimais + "m²")
   - tipo (ex: grama, terreno natural, piso drenante etc)
   - Tratar as quebras de linha representadas por \\n como separadores de linhas, como se fosse um quadro visual.
   - Ignorar símbolos isolados como -, letras soltas, barras duplicadas e ruídos do OCR.
   - Exemplo de entrada típica:
     Área permeável 01 17,08 m?
     grama
     -
     Área permeável 02
     grama 6,29 m?
     ...
     → Deve ser interpretado como:
     Área permeável 01 grama 17,08 m²
     Área permeável 02 grama 6,29 m²

   Use a estrutura textual semelhante a uma tabela para facilitar a leitura.

2. **area_terreno** → número (em m²)  
   - Valor total da área do lote do projeto. 
   - insira o valor extraído com duas casas decimais e adicione "m²" no final.
   - Exemplo: 300,00 m². 
   - Busque expressões como “Área do terreno”, “Área total do terreno”, "área do lote", "lote" ou similares.  
   - O número pode aparecer em outra posição na linha. Exemplo: Área do terreno ... 300,00 m²
   - Sempre será o maior valor da linha

3. **area_permeavel_total** → número (em m²)  
   - insira o valor extraído com duas casas decimais e adicione "m²" no final.
   - Mesmo que os valores numéricos apareçam **depois**, faça a relação com os termos anteriores.
   - Exemplo típico embaralhado:
     Área permeável 01 grama Área permeável 02 grama Área permeável 03 grama 21,50 m² 15,05 m² 21,50 m²  
     → Isso representa 3 áreas: 21,50 + 15,05 + 21,50.

4. **percentual_total** → número (%)  
   - A taxa de permeabilidade **usada** no projeto.  
   - Procure frases como “taxa de permeabilidade usada”, “em aprovação”, “calculada”, "taxa de permeabilidade total" , "permeabilidade total".  
   - Ignorar “taxa mínima” ou “exigida”.
   - Sempre será um número em percentual.
   - insira o valor extraído com duas casas decimais e adicione "%" no final.

5. **percentual_grama** → número (%)  
   - Calculado com base nas áreas marcadas com “grama”, "gramado", "área gramada".  
   - insira o valor extraído com duas casas decimais e adicione "%" no final.

6. **conforme** → booleano  
   - true se o campo percentual_total for ≥ 20, caso contrário false.

---

Linhas extraídas:
{linhas_final}
"""


def montar_prompt_carimbo(linhas_final: str) -> str:
    return f"""
Você é um assistente técnico responsável por interpretar carimbos de projetos arquitetônicos. O texto abaixo foi extraído com OCR e pode conter erros, como quebras de linha erradas, símbolos soltos, ou termos repetidos. 

Seu papel é identificar os seguintes campos principais e retorná-los em formato JSON. Extraia **somente os dados úteis** e ignore cabeçalhos genéricos como "Prefeitura", "Processo", "Aprovado", "Visto", etc.

⚠️ Regras importantes de validação:
- As respostas extraídas **não podem ser cópias literais** dos nomes dos campos. Exemplo: 
  - Se o campo for "proprietário", a resposta não pode ser "proprietário".
  - Se o campo for "responsável técnico", a resposta deve ser um nome real (ex: "João da Silva – CAU A123456").
- Se uma informação estiver ausente ou ilegível, retorne como `"Não identificado"`.
- Nunca preencha um campo com o conteúdo de outro (ex: "ZONA" não pode aparecer como "bairro").

⚠️ Regras por campo:
- "bairro" deve conter apenas palavras (ex: "Centro", "Vila Nova"). Nunca pode ser: "ZONA", "LOTE", "USO".
- "zona", "quadra" e "lote" devem conter **apenas números** (ou número+letra no caso do lote). Nunca palavras.
- "zoneamento" deve ser um código com letras e números (ex: "ZR1", "ZM"). Nunca apenas palavras como "residencial".
- "área do lote", "área construída", "área existente" e "área demolida" devem conter valores como "215,53 m²" (duas casas decimais + unidade).
- "uso" deve ser textual: "residencial", "comercial", "misto", etc. Nunca números ou siglas.
- "coeficiente de aproveitamento" deve ser número decimal com vírgula, ex: "1,00", "2,00".
- "número da prancha" deve ser no formato "01/02", "02/02", etc.
- "proprietário" deve ser nomes completos. Se vier apenas "PROPRIETÁRIO", considere inválido. Pode conter mais de um nome e semre virá acompanhado da sigla "CPF" e depois o número..
- "responsável técnico" deve ser nomes completos. Se vier apenas "responsável técnico", considere inválido. Sempre virá  acompanhado de uma sigla "CAU" ou "CREA" e depois o número.
- Ignore linhas que contenham múltiplos rótulos colados, como "ÁREA DO LOTE Uso C.A. Nº PRANCHA". Elas não contêm valores. 
- Se algum campo não puder ser identificado, retorne como "Não identificado".


Campos obrigatórios no JSON:
- bairro
- zona
- quadra
- lote
- zoneamento
- área do lote
- área construída
- área existente
- área demolida
- uso
- coeficiente de aproveitamento
- número da prancha
- proprietário
- responsável técnico

Corrija separações erradas e não retorne repetições. Agrupe nomes corretamente mesmo que estejam quebrados em várias linhas.

Retorne **somente o JSON final com os campos extraídos**.

Texto extraído:
{linhas_final}
"""

def montar_prompt_quadro_areas_unidade(linhas_final: str) -> str:
    return f"""
Você é um assistente técnico responsável por interpretar quadros de áreas por unidade em projetos arquitetônicos. O conteúdo abaixo foi extraído automaticamente com OCR e pode conter erros comuns como:

- Linhas desalinhadas ou incompletas
- Dados agrupados incorretamente
- Separações incorretas de colunas ou textos soltos
- Unidades repetidas ou identificadas sem cabeçalhos claros
- Considere apenas linhas com nomes de apartamentos, valores em m² ou número de vagas. Não crie unidades que não estão explicitamente listadas.


Seu objetivo é organizar os dados corretamente e retornar um JSON com as seguintes informações, **agrupadas por unidade**, mesmo que alguns campos estejam ausentes ou ilegíveis. Caso algum campo esteja ausente em uma unidade, deixe-o como `"Não identificado"`.

---

📊 Estrutura esperada por unidade:

{{
  [
    {{
      "unidade": "Apartamento 101",
      "area_privativa_coberta": "76,30 m²",
      "area_comum": "26,00 m²",
      "area_garagem_privativa": "18,25 m²",
      "area_garagem_descoberta": "0,00 m²",
      "quantidade_vagas": "1",
      "area_total_unidade": "122,55 m²",
      "numero_quartos": "3",
      "numero_suites": "1",
      "tipo_cobertura": "LAJE"
    }},
    {{
      "unidade": "Apartamento 102",
      "area_privativa_coberta": "76,30 m²",
      "area_comum": "26,00 m²",
      "area_garagem_privativa": "18,55 m²",
      "area_garagem_descoberta": "0,00 m²",
      "quantidade_vagas": "1",
      "area_total_unidade": "123,05 m²",
      "numero_quartos": "3",
      "numero_suites": "1",
      "tipo_cobertura": "LAJE"
    }}
  ]
}}

📌 Regras importantes:
- Use exatamente essa estrutura acima.
- Todos os campos devem ser preenchidos. Se algum dado estiver ausente ou ilegível, escreva `"Não identificado"`.
- As áreas devem conter duas casas decimais + `" m²"`.
- Sempre que possível, relacione os valores da linha com a unidade imediatamente anterior.
- Os nomes das unidades devem ser preservados exatamente como aparecem no texto (ex: "APTO 101", "Apartamento 102").

Texto extraído:
{linhas_final}
"""

def montar_prompt_quadro_areas_pavimento(linhas_final: str) -> str:
    return f"""
Você é um assistente técnico especializado em leitura de quadros de áreas por pavimento. O conteúdo abaixo foi extraído automaticamente por OCR e pode conter:

- Colunas desalinhadas
- Palavras duplicadas ou separadas incorretamente
- Valores embaralhados na mesma linha
- Linhas de totais que não devem ser tratadas como pavimentos
- Ignore linhas com texto "TOTAL". Apenas extraia dados de pavimentos reais como "Subsolo", "Pavimento Térreo", etc.


Seu objetivo é organizar os dados corretamente e retornar um JSON com a seguinte estrutura:

[
  {{
    "pavimento": "Pavimento Térreo",
    "existente": "89,91 m²",
    "a_construir": "0,00 m²",
    "a_demolir": "0,00 m²",
    "subtotal": "89,91 m²",
    "total": "89,91 m²"
  }},
  {{
    "pavimento": "Primeiro Pavimento",
    "existente": "116,28 m²",
    "a_construir": "0,00 m²",
    "a_demolir": "8,70 m²",
    "subtotal": "124,98 m²",
    "total": "124,98 m²"
  }}
]

📌 Regras importantes:
- Sempre inclua todos os campos listados no JSON, mesmo que o valor seja "0,00 m²" ou "Não identificado".
- Os valores devem estar sempre com duas casas decimais + "m²".
- Ignore linhas como "Total", "Subtotal Geral", "Área total", que não representam pavimentos individuais.
- Os nomes dos pavimentos devem ser extraídos conforme aparecem no texto (ex: "Pavimento Térreo", "Primeiro Pavimento").
- Se não for possível associar um valor corretamente, retorne "Não identificado".
- Corrija formatos como "m?" para "m²" quando possível.
- Mantenha a ordem dos pavimentos conforme aparecem.
-Ignore linhas com totalização geral. Apenas inclua pavimentos que sejam níveis específicos (ex: "Pavimento Térreo", "Subsolo", "1º andar").


Texto extraído:
{linhas_final}
"""
