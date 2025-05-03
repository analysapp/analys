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

  // Normalizar texto para evitar problemas de maiúsculas/minúsculas
  const texto = textoExtraido.toLowerCase()

// 1. Verificar se o Coeficiente de Aproveitamento está correto
const coeficienteEsperado = 2; // valor fixo de Itaúna

const regexCoef = /coeficiente( de aproveitamento)?( de)?\s*:?\s*([\d,.]+)/i;
const matchCoef = texto.match(regexCoef);

if (matchCoef) {
  const valorTexto = matchCoef[3].replace(',', '.');
  const valor = parseFloat(valorTexto);

  resultados.push({
    parametro: 'Coeficiente de Aproveitamento',
    conforme: valor >= coeficienteEsperado,
    valorEncontrado: valorTexto,
    esperado: coeficienteEsperado.toString(),
    observacao: valor >= coeficienteEsperado ? undefined : `Valor abaixo do exigido (${coeficienteEsperado})`
  });
} else {
  resultados.push({
    parametro: 'Coeficiente de Aproveitamento',
    conforme: false,
    esperado: coeficienteEsperado.toString(),
    observacao: 'Nenhuma referência ao coeficiente localizada'
  });
}



  // 2. Verificar se menciona o recuo frontal de 3 metros (300 cm)
  if (texto.includes('recuo frontal')) {
    const encontrou300 = texto.includes('3,00m') || texto.includes('300cm')
    resultados.push({
      parametro: 'Recuo Frontal',
      conforme: encontrou300,
      esperado: '300 cm',
      valorEncontrado: encontrou300 ? '300 cm' : 'Não encontrado'
    })
  } else {
    resultados.push({
      parametro: 'Recuo Frontal',
      conforme: false,
      esperado: '300 cm',
      observacao: 'Nenhuma referência ao recuo localizada'
    })
  }

  // 3. Verificar se menciona a taxa de permeabilidade de 20% (mínimo padrão)
  const taxaPadrao = permeabilityRate.find(b => b.basin.includes('Macrozona Urbana'))?.minPercent || 20
  if (texto.includes('permeabilidade')) {
    const encontrou20 = texto.includes('20%') || texto.includes('20 %')
    resultados.push({
      parametro: 'Taxa de Permeabilidade',
      conforme: encontrou20,
      esperado: '20%',
      valorEncontrado: encontrou20 ? '20%' : 'Não encontrado'
    })
  } else {
    resultados.push({
      parametro: 'Taxa de Permeabilidade',
      conforme: false,
      esperado: '20%',
      observacao: 'Nenhuma referência à permeabilidade localizada'
    })
  }

  // (Novas análises serão adicionadas aqui, ex: altura máxima, faixa livre da calçada etc.)

  return resultados
}
