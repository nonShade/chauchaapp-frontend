import { useState, useCallback, useEffect, useRef } from "react";
import { Notification } from "@/types/notification";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchNotifications,
  deleteNotification,
  acceptGroupInvitation,
  declineGroupInvitation,
} from "@/services/api/notifications";
import {
  useNotificationPermission,
} from "@/hooks/useNotificationPermission";
import {
  getMeta,
  NOTIFICATION_TYPES,
} from "@/constants/notificationConfig";

interface UseNotificationsReturn {
  notifications:       Notification[];
  loading:             boolean;
  error:               string | null;
  pushGranted:         boolean;
  requestPushPermission: () => Promise<boolean>;
  loadNotifications:   () => Promise<void>;
  removeNotification:  (notificationId: string) => Promise<void>;
  acceptInvitation:    (invitationId: string, notificationId: string) => Promise<void>;
  declineInvitation:   (invitationId: string, notificationId: string) => Promise<void>;
  markAllAsSeen:       () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // IDs ya notificados en esta sesión para no repetir push
  const notifiedIds = useRef<Set<string>>(new Set());

  // ─── DEBUG: Notificaciones de prueba ─────────────────────────────────────────
// TODO: eliminar cuando el backend genere notificaciones reales.
const now = Date.now();
const DEBUG_NOTIFICATIONS: Notification[] = [
  // ── Próximos gastos (recordatorios) ──
  {
    notification_id: "debug-7", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.TRANSACTION_REMINDER,
    notification_status: "read",
    message: "En 3 días vence tu gasto \"Dividendo Departamento\" por $420.000 (23 de abril). Revisa tu saldo.",
    scheduled_date: new Date(now - 41 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "tx-debug-007", reference_type: "transaction", seen_at: new Date().toISOString(),
  },
  {
    notification_id: "debug-8", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.TRANSACTION_REMINDER,
    notification_status: "unread",
    message: "Esta semana tienes un gasto programado: \"TAG autopista\" por $35.000 el 25 de abril.",
    scheduled_date: new Date(now - 42 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "tx-debug-008", reference_type: "transaction", seen_at: null,
  },
  // ── Otras notificaciones ──
  {
    notification_id: "debug-6", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.SYSTEM_INFO,
    notification_status: "unread",
    message: "ChauchaApp se actualizó a la versión 2.1.0. Revisa las novedades en el menú principal.",
    scheduled_date: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "", reference_type: "system", seen_at: null,
  },
  {
    notification_id: "debug-5", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.EDUCATIONAL,
    notification_status: "unread",
    message: "Nuevo módulo disponible: Inversión para principiantes. ¡Aprende a hacer crecer tu dinero!",
    scheduled_date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "module-debug-005", reference_type: "educational_module", seen_at: null,
  },
  // Solo 1 tip
  {
    notification_id: "debug-4", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.TIP,
    notification_status: "unread",
    message: "Ahorra al menos el 20% de tus ingresos mensuales para crear un fondo de emergencia.",
    scheduled_date: new Date(now - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "", reference_type: "tip", seen_at: null,
  },
];

  const { granted: pushGranted, requestPermission, sendPush } =
    useNotificationPermission();

  // ── Disparar push para notificaciones nuevas ─────────────────────────────
  const pushNewNotifications = useCallback(
    async (items: Notification[]) => {
      if (!pushGranted) return;

      const unseen = items.filter(
        (n) => !n.seen_at && !notifiedIds.current.has(n.notification_id)
      );

      for (const n of unseen) {
        const meta = getMeta(n.notification_type);
        await sendPush({ title: meta.label, body: n.message });
        notifiedIds.current.add(n.notification_id);
      }
    },
    [pushGranted, sendPush]
  );

  // ── Cargar notificaciones ────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(accessToken);

      const merged = [
        ...DEBUG_NOTIFICATIONS,
        ...data,
      ].filter(
        (item, index, self) =>
          index === self.findIndex(
            (n) => n.notification_id === item.notification_id
          )
      );

      setNotifications(merged);
      await pushNewNotifications(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar notificaciones"
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, pushNewNotifications]);

  // ── Eliminar notificación ────────────────────────────────────────────────
  const removeNotification = useCallback(
    async (notificationId: string) => {
      try {
        // Notificación de prueba
        if (notificationId.startsWith("debug-")) {
          setNotifications((prev) =>
            prev.filter((n) => n.notification_id !== notificationId)
          );
          return;
        }

        await deleteNotification(notificationId, accessToken);

        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId)
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al eliminar notificación"
        );
      }
    },
    [accessToken]
  );

  // ── Aceptar invitación ───────────────────────────────────────────────────
  const acceptInvitation = useCallback(
    async (invitationId: string, notificationId: string) => {
      try {
        if (notificationId.startsWith("debug-")) {
          setNotifications((prev) =>
            prev.filter((n) => n.notification_id !== notificationId)
          );
          return;
        }

        await acceptGroupInvitation(invitationId, accessToken);
        await deleteNotification(notificationId, accessToken);

        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId)
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al aceptar invitación"
        );
      }
    },
    [accessToken]
  );

  // ── Rechazar invitación ──────────────────────────────────────────────────
  const declineInvitation = useCallback(
    async (invitationId: string, notificationId: string) => {
      try {
        if (notificationId.startsWith("debug-")) {
          setNotifications((prev) =>
            prev.filter((n) => n.notification_id !== notificationId)
          );
          return;
        }

        await declineGroupInvitation(invitationId, accessToken);
        await deleteNotification(notificationId, accessToken);

        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId)
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al rechazar invitación"
        );
      }
    },
    [accessToken]
  );

  const markAllAsSeen = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        seen_at: notification.seen_at ?? new Date().toISOString(),
      }))
    );
  }, []);

  return {
    notifications,
    loading,
    error,
    pushGranted,
    requestPushPermission: requestPermission,
    loadNotifications,
    removeNotification,
    acceptInvitation,
    declineInvitation,
    markAllAsSeen,
  };
}