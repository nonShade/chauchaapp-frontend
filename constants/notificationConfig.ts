import { Ionicons } from "@expo/vector-icons";

// ─── TIPOS ───────────────────────────────────────────────────────
// Mantener sincronizado con los valores que retorna el backend en
// notification_type. Cualquier valor fuera de esta lista cae en FALLBACK.

export const NOTIFICATION_TYPES = {
  // Grupo familiar
  GROUP_JOIN_REQUEST:  "group_join_request",
  GROUP_JOIN_ACCEPTED: "group_join_accepted",
  GROUP_JOIN_REJECTED: "group_join_rejected",

  // Educativos / tips
  TIP:                 "tip",
  EDUCATIONAL:         "educational_reminder",

  // Sistema
  SYSTEM_INFO:         "system_info",

  // Recordatorios de transacción (color variable por fecha)
  TRANSACTION_REMINDER: "transaction_reminder",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES] | string;

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────
// Agrupa tipos con la misma lógica de color/icono.

export type NotificationCategory =
  | "group"       // verdosos
  | "tip"         // naranjas
  | "system"      // azules
  | "reminder"    // color variable por fecha
  | "unknown";    // fallback

/**
 * Devuelve la categoría de una notificación dado su tipo.
 * Modifica este switch cuando cambien los tipos del backend.
 */
export function getCategory(type: NotificationType): NotificationCategory {
  switch (type) {
    case NOTIFICATION_TYPES.GROUP_JOIN_REQUEST:
    case NOTIFICATION_TYPES.GROUP_JOIN_ACCEPTED:
    case NOTIFICATION_TYPES.GROUP_JOIN_REJECTED:
      return "group";

    case NOTIFICATION_TYPES.TIP:
    case NOTIFICATION_TYPES.EDUCATIONAL:
      return "tip";

    case NOTIFICATION_TYPES.SYSTEM_INFO:
      return "system";

    case NOTIFICATION_TYPES.TRANSACTION_REMINDER:
      return "reminder";

    default:
      return "unknown";
  }
}

// ─── PALETAS BASE ─────────────────────────────────────────────────────────

export interface NotificationPalette {
  bg: string;
  border: string;
  iconColor: string;
  labelColor: string;
  /** Solo para group_join_request: fondo oscuro con botones de acción */
  isDark?: boolean;
}

// Paletas estáticas por categoría (excepto "reminder" que es dinámica)
export const CATEGORY_PALETTE: Record<Exclude<NotificationCategory, "reminder">, NotificationPalette> = {
  group: {
    bg:         "rgb(4, 16, 17)",
    border:     "rgb(6, 41, 29)",
    iconColor:  "rgb(32, 163, 83)",
    labelColor: "#fff",
    isDark:     true,
  },
  tip: {
    bg:         "#fff7ed",
    border:     "#fed7aa",
    iconColor:  "#c2410c",
    labelColor: "#9a3412",
  },
  system: {
    bg:         "#eff6ff",
    border:     "#bfdbfe",
    iconColor:  "#1d4ed8",
    labelColor: "#1e40af",
  },
  unknown: {
    bg:         "#f8fafc",
    border:     "#cbd5e1",
    iconColor:  "#475569",
    labelColor: "#334155",
  },
};

/**
 * Paleta dinámica para recordatorios según distancia a la fecha programada.
 *  - Rojo   → ya pasó o falta ≤ 1 día
 *  - Amarillo → falta ≤ 7 días
 *  - Teal   → falta > 14 días
 */
export function getReminderPalette(scheduledDate: string): NotificationPalette {
  const now      = new Date();
  const target   = new Date(scheduledDate);
  const diffDays = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays <= 1) {
    return { bg: "#fef2f2", border: "#fca5a5", iconColor: "#dc2626", labelColor: "#991b1b" };
  }
  if (diffDays <= 7) {
    return { bg: "#fefce8", border: "#fde047", iconColor: "#ca8a04", labelColor: "#92400e" };
  }
  // > 14 días → teal
  return   { bg: "#f0fdfa", border: "#99f6e4", iconColor: "#0d9488", labelColor: "#0f766e" };
}

/**
 * Resuelve la paleta correcta para cualquier notificación.
 */
export function getPalette(type: NotificationType, scheduledDate?: string): NotificationPalette {
  const category = getCategory(type);
  if (category === "reminder" && scheduledDate) {
    return getReminderPalette(scheduledDate);
  }
  return CATEGORY_PALETTE[category as Exclude<NotificationCategory, "reminder">]
    ?? CATEGORY_PALETTE.unknown;
}

// ─── METADATOS DE VISUALIZACIÓN ───────────────────────────────────────────
// Icono y etiqueta por tipo específico.
// Actualiza esta tabla cuando el backend agregue o renombre tipos.

export interface NotificationMeta {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  /** true = este tipo tiene botones Aceptar/Rechazar */
  hasActions?: boolean;
}

const META_MAP: Record<string, NotificationMeta> = {
  [NOTIFICATION_TYPES.GROUP_JOIN_REQUEST]:  { icon: "people-outline",              label: "Solicitud de grupo",     hasActions: true },
  [NOTIFICATION_TYPES.GROUP_JOIN_ACCEPTED]: { icon: "checkmark-circle-outline",    label: "Solicitud aceptada" },
  [NOTIFICATION_TYPES.GROUP_JOIN_REJECTED]: { icon: "close-circle-outline",        label: "Solicitud rechazada" },
  [NOTIFICATION_TYPES.TIP]:                 { icon: "bulb-outline",                label: "Consejo financiero" },
  [NOTIFICATION_TYPES.EDUCATIONAL]:         { icon: "school-outline",              label: "Módulo educativo" },
  [NOTIFICATION_TYPES.SYSTEM_INFO]:         { icon: "information-circle-outline",  label: "Información" },
  [NOTIFICATION_TYPES.TRANSACTION_REMINDER]:{ icon: "calendar-outline",            label: "Recordatorio" },
};

const FALLBACK_META: NotificationMeta = {
  icon:  "notifications-outline",
  label: "Notificación",
};

export function getMeta(type: NotificationType): NotificationMeta {
  return META_MAP[type] ?? FALLBACK_META;
}