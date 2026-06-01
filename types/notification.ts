export interface Notification {
  notification_id: string;
  user_id: string;
  /** Tipo de notificación — ver NOTIFICATION_TYPES en notificationConfig.ts */
  notification_type: string;
  notification_status: string;
  message: string;
  scheduled_date: string;
  reference_id: string;
  reference_type: string;
  /** Fecha en que el usuario vio la notificación (null = no vista aún) */
  seen_at?: string | null;
}