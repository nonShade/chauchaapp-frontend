export enum IncomeType {
  SUELDO_FIJO = 'SUELDO_FIJO',
  INDEPENDIENTE = 'INDEPENDIENTE',
  MIXTO = 'MIXTO',
  OTRO = 'OTRO',
}

export const IncomeTypeLabel: Record<IncomeType, string> = {
  [IncomeType.SUELDO_FIJO]: 'Sueldo fijo',
  [IncomeType.INDEPENDIENTE]: 'Independiente',
  [IncomeType.MIXTO]: 'Mixto',
  [IncomeType.OTRO]: 'Otro',
};