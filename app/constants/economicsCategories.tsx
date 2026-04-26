export enum EconomicCategory {
  SUELDO_MINIMO = 'SUELDO_MINIMO',
  COMBUSTIBLE = 'COMBUSTIBLE',
  ALIMENTOS = 'ALIMENTOS',
  VIVIENDA = 'VIVIENDA',
  TRANSPORTE = 'TRANSPORTE',
  SERVICIOS_BASICOS = 'SERVICIOS_BASICOS',
  IMPUESTOS = 'IMPUESTOS',
  CREDITOS = 'CREDITOS',
  AHORRO = 'AHORRO',
  INVERSIONES = 'INVERSIONES',
}

export const EconomicCategoryInfo = {
  [EconomicCategory.SUELDO_MINIMO]: {
    name: 'Sueldo mínimo',
    description: 'Cambios en el sueldo mínimo',
  },
  [EconomicCategory.COMBUSTIBLE]: {
    name: 'Combustible',
    description: 'Precios bencina/diesel',
  },
  [EconomicCategory.ALIMENTOS]: {
    name: 'Alimentos',
    description: 'IPC y canasta básica',
  },
  [EconomicCategory.VIVIENDA]: {
    name: 'Vivienda',
    description: 'Arriendos, dividendos, UF',
  },
  [EconomicCategory.TRANSPORTE]: {
    name: 'Transporte',
    description: 'Tarifas y movilidad',
  },
  [EconomicCategory.SERVICIOS_BASICOS]: {
    name: 'Servicios básicos',
    description: 'Luz, agua, internet',
  },
  [EconomicCategory.IMPUESTOS]: {
    name: 'Impuestos',
    description: 'IVA, retenciones, SII',
  },
  [EconomicCategory.CREDITOS]: {
    name: 'Créditos',
    description: 'Tasas y condiciones',
  },
  [EconomicCategory.AHORRO]: {
    name: 'Ahorro',
    description: 'APV, depósitos, fondos',
  },
  [EconomicCategory.INVERSIONES]: {
    name: 'Inversiones',
    description: 'Bolsa, fondos mutuos',
  },
};