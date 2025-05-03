import { coefficientOfUse, landQuota, calcularAfastamento } from './urbanParameters'

describe('Testes dos parâmetros urbanísticos', () => {
  it('Coeficiente básico geral deve ser 2', () => {
    const geral = coefficientOfUse.find(z => z.zone.includes('Todas'));
    expect(geral?.basic).toBe(2);
  });

  it('Quota de terreno para ZCS deve ser 35m²', () => {
    const zcs = landQuota.find(z => z.zone === 'ZCS');
    expect(zcs?.squareMeters).toBe(35);
  });

  it('Afastamento lateral para edifício de 10m de altura deve ser 200cm', () => {
    expect(calcularAfastamento(10)).toBe(200);
  });
});
