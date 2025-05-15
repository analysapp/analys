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
