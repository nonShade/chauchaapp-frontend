import { Ionicons } from '@expo/vector-icons';

export type IoniconName = keyof typeof Ionicons.glyphMap;

export const CATEGORY_ICONS: Record<string, IoniconName> = {
  vivienda: 'home-outline',
  'alimentación': 'restaurant-outline',
  alimentacion: 'restaurant-outline',
  transporte: 'car-outline',
  servicios: 'flash-outline',
  'servicios básicos': 'flash-outline',
  'servicios basicos': 'flash-outline',
  salud: 'heart-outline',
  entretenimiento: 'film-outline',
  'educación': 'school-outline',
  educacion: 'school-outline',
  vestuario: 'shirt-outline',
  'créditos': 'card-outline',
  creditos: 'card-outline',
  ahorro: 'cash-outline',
  'otros gastos': 'ellipsis-horizontal-outline',

  // Income categories
  sueldo: 'trending-up-outline',
  freelance: 'laptop-outline',
  'bonificación': 'gift-outline',
  bonificacion: 'gift-outline',
  inversiones: 'stats-chart-outline',
  'otros ingresos': 'ellipsis-horizontal-outline',

  // Generic fallback key
  otros: 'ellipsis-horizontal-outline',
};

export const getCategoryIcon = (name: string): IoniconName =>
  CATEGORY_ICONS[name.toLowerCase().trim()] ?? 'pricetag-outline';

export const NAV_ICONS = {
  back: 'arrow-back',
  add: 'add',
  wallet: 'wallet-outline',
  person: 'person-outline',
  people: 'people-outline',
  alert: 'alert-circle-outline',
  checkmark: 'checkmark',
  calendar: 'calendar-outline',
  calendarFill: 'calendar',
} as const satisfies Record<string, IoniconName>;

export const TRANSACTION_TYPE_ICONS = {
  expense: 'trending-down-outline',
  income: 'trending-up-outline',
} as const satisfies Record<string, IoniconName>;

export const FREQUENCY_ICONS = {
  once: 'checkmark-circle-outline',
  monthly: 'repeat-outline',
  weekly: 'refresh-outline',
} as const satisfies Record<string, IoniconName>;