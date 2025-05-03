// src/services/analisarProjeto.test.ts

import { analisarProjeto } from './analisarProjeto'

describe('Teste de Análise de Projeto (analisarProjeto)', () => {
  it('Deve identificar projeto conforme para coeficiente, recuo e permeabilidade', async () => {
    const mockTexto = `
      Projeto de edificação com coeficiente de aproveitamento 2,00.
      O recuo frontal é de 3,00m.
      Taxa de permeabilidade indicada é de 20%.
    `

    const resultado = await analisarProjeto(mockTexto)

    const coef = resultado.find(r => r.parametro.includes('Coeficiente'))
    expect(coef?.conforme).toBe(true)

    const recuo = resultado.find(r => r.parametro.includes('Recuo Frontal'))
    expect(recuo?.conforme).toBe(true)

    const permeabilidade = resultado.find(r => r.parametro.includes('Permeabilidade'))
    expect(permeabilidade?.conforme).toBe(true)
  })
})
