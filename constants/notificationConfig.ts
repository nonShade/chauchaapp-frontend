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
  | "group"
  | "tip"
  | "system"
  | "reminder"
  | "unknown";

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

// ─── Paleta de colores para la vista de notificaciones ───────────────────────
export const NOTIFICATION_COLORS = {
  groupBg:      "#0a1912",
  groupBorder:  "#0d2b1c",
  groupBadgeBg: "#0d2b1c",
  groupAccent:  "#20a353",

  tipBg:        "#10141b",
  tipBorder:    "#292e36",
  tipBadgeBg:   "#1d2229",
  tipAccent:    "#ffffff",

  recBg:        "#ff98451a",
  recBorder:    "#ff984540",
  recBadgeBg:   "#ff984526",
  recAccent:    "#ff9845",

  otherBg:      "#0a1912",
  otherBorder:  "#0d2b1c",
  otherBadgeBg: "#0d2b1c",
  otherAccent:  "#00a3cd",

  msgText:      "#8b8f95",
  newBadgeBg:   "#0d2b1c",
  newBadgeText: "#20a353",

  textPrimary:   "#f1f5f9",
  textSecond:    "#64748b",
  cardBorder:    "#1e293b",
  bg:            "#06090f",
} as const;