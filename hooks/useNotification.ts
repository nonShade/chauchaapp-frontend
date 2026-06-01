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
}

export function useNotifications(): UseNotificationsReturn {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // IDs ya notificados en esta sesión para no repetir push
  const notifiedIds = useRef<Set<string>>(new Set());

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
      setNotifications(data);
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
        await deleteNotification(notificationId, accessToken);
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId)
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al eliminar notificación"
        );
      }
    },
    [accessToken]
  );

  // ── Aceptar invitación ───────────────────────────────────────────────────
  const acceptInvitation = useCallback(
    async (invitationId: string, notificationId: string) => {
      try {
        await acceptGroupInvitation(invitationId, accessToken);
        await deleteNotification(notificationId, accessToken);
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId)
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al aceptar invitación"
        );
      }
    },
    [accessToken]
  );

  // ── Rechazar invitación ──────────────────────────────────────────────────
  const declineInvitation = useCallback(
    async (invitationId: string, notificationId: string) => {
      try {
        await declineGroupInvitation(invitationId, accessToken);
        await deleteNotification(notificationId, accessToken);
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId)
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al rechazar invitación"
        );
      }
    },
    [accessToken]
  );

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
  };
}