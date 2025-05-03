// Parâmetros Urbanísticos - Itaúna
// Gerado com base na Lei Complementar 172/22 e documentos municipais

export const coefficientOfUse = [
    { zone: 'Todas as zonas', basic: 2, max: 2 },
    { zone: 'Zona Central Secundária (ZCS)', basic: 3, max: 3 },
    { zone: 'Zonas ZM, ZIS, ZMA e ZCP', basic: 2, max: 2.5 },
    { zone: 'Demais zonas', basic: 2, max: 2 }
  ];
  
  export const landQuota = [
    { zone: 'ZCA', squareMeters: 50 },
    { zone: 'ZCS', squareMeters: 35 },
    { zone: 'ZM', squareMeters: 50 },
    { zone: 'ZIS', squareMeters: 35 },
    { zone: 'ZPA-1', squareMeters: 50 },
    { zone: 'ZMA', squareMeters: 35 },
    { zone: 'ZCP', squareMeters: 40 },
    { zone: 'Outras zonas', squareMeters: 40 }
  ];
  
  export const permeabilityRate = [
    { basin: 'Angu Seco (Benfica / Dr. Augusto Gonçalves)', minPercent: 60 },
    { basin: 'Sumidouro - área urbana', minPercent: 30 },
    { basin: 'Sumidouro - expansão urbana', minPercent: 60 },
    { basin: 'Outras bacias urbana', minPercent: 20 },
    { basin: 'Bacias rural', minPercent: 70 }
  ];
  
  export const setbacks = {
    frontal: 300, // cm
    lateralFormula: '150 + 5 * H', // H em metros, resultado em cm
  };
  
  export const sidewalk = {
    serviceStripMin: 70, // cm
    freeStripMin: 120, // cm
    accessibleFreeMin: 90, // cm
    maxRampInclinationPercent: 8.33, // 1:12
  };
  
  export const slopeLimits = {
    longitudinal: [
      { maxPercent: 14, notes: 'sem degrau' },
      { range: '14-25', notes: 'com degrau' },
      { minPercent: 25, notes: 'escadas obrigatórias' }
    ],
    transversal: { range: '1-3', notes: 'escoamento pluvial' }
  };
  
  export const vehicularAccess = {
    maxRamp: 70, // cm
    minDistanceBetweenDrops: 600, // cm
    maxDropWidth: 600, // cm
    minCornerDistance: 500 // cm
  };
  
  export const parkingRequirements = [
    { type: 'Residencial', areaMin: 15 },
    { type: 'Residencial multifamiliar em ZIS', areaMin: 12 },
    { type: 'Não residencial ≤200m²', areaMin: 12 },
    { type: 'Não residencial >200m²', areaMinPer100: 12 }
  ];
  
  // Função utilitária para calcular afastamento lateral/fundo
  export function calcularAfastamento(H: number): number {
    // Retorna valor em cm
    return 150 + 5 * H;
  }
  