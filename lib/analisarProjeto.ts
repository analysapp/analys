// services/analisarProjeto.ts

import { coefficientOfUse, landQuota, permeabilityRate, setbacks, calcularAfastamento } from '../constants/urbanParameters'

interface ResultadoAnalise {
  parametro: string
  conforme: boolean
  valorEncontrado?: string
  esperado?: string
  observacao?: string
}

/**
 * Função para analisar o texto extraído do projeto OCR
 */
export async function analisarProjeto(textoExtraido: string): Promise<ResultadoAnalise[]> {
  const resultados: ResultadoAnalise[] = []

  const texto = textoExtraido.toLowerCase().replace(/\s+/g, ' ')

  // === 1. COEFICIENTE DE APROVEITAMENTO ===
  const coefRegex = /c\.?a\.?[:\s]*([0-9]+[\.,]?[0-9]*)/i
  const coefMatch = texto.match(coefRegex)
  const coeficienteEsperado = coefficientOfUse.find(c => c.zone.includes('Todas as zonas'))?.basic || 2

  if (coefMatch) {
    const valor = parseFloat(coefMatch[1].replace(',', '.'))
    resultados.push({
      parametro: 'Coeficiente de Aproveitamento',
      conforme: valor <= coeficienteEsperado,
      valorEncontrado: `${valor}`,
      esperado: `≤ ${coeficienteEsperado}`,
      observacao: valor > coeficienteEsperado ? 'Valor excede o máximo permitido por lei.' : undefined
    })
  } else {
    resultados.push({
      parametro: 'Coeficiente de Aproveitamento',
      conforme: false,
      esperado: `≤ ${coeficienteEsperado}`,
      observacao: 'Coeficiente não encontrado.'
    })
  }

  // === 2. TAXA DE PERMEABILIDADE ===
  const taxaRegex = /perme[aá]vel.*?(\d{1,2}[\.,]?\d{0,2})\s?%/i
  const taxaMatch = texto.match(taxaRegex)
  const taxaMinima = permeabilityRate.find(b => b.basin.includes('Macrozona Urbana'))?.minPercent || 20

  if (taxaMatch) {
    const valor = parseFloat(taxaMatch[1].replace(',', '.'))
    resultados.push({
      parametro: 'Taxa de Permeabilidade',
      conforme: valor >= taxaMinima,
      valorEncontrado: `${valor}%`,
      esperado: `≥ ${taxaMinima}%`,
      observacao: valor < taxaMinima ? 'Valor inferior ao mínimo exigido por norma.' : undefined
    })
  } else {
    resultados.push({
      parametro: 'Taxa de Permeabilidade',
      conforme: false,
      esperado: `≥ ${taxaMinima}%`,
      observacao: 'Não encontrado valor da taxa de permeabilidade.'
    })
  }

  // === 3. RECUO FRONTAL ===
  const recuoRegex = /recuo[^a-z]{0,10}frontal[^a-z]{0,10}(3[\.,]?00\s?cm|3[\.,]?00|3[\.,]?0{1,2}\s?m)/i
  const encontrouRecuo = recuoRegex.test(texto)

  resultados.push({
    parametro: 'Recuo Frontal',
    conforme: encontrouRecuo,
    esperado: '≥ 3,00m / 300cm',
    valorEncontrado: encontrouRecuo ? 'Aparentemente presente' : 'Não identificado',
    observacao: encontrouRecuo ? undefined : 'Não foi localizado um recuo frontal de 3 metros'
  })

  return resultados
}
