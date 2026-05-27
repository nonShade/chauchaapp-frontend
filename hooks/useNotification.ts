import { useState, useCallback } from "react";
import { Notification } from "@/types/notification";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchNotifications,
  deleteNotification,
  acceptGroupInvitation,
  declineGroupInvitation,
} from "@/services/api/notifications";

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  loadNotifications: () => Promise<void>;
  removeNotification: (notificationId: string) => Promise<void>;
  acceptInvitation: (invitationId: string, notificationId: string) => Promise<void>;
  declineInvitation: (invitationId: string, notificationId: string) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(accessToken);
      setNotifications(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar notificaciones"
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

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

  // Acepta la invitación y luego elimina la notificación del listado
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

  // Rechaza la invitación y luego elimina la notificación del listado
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
    loadNotifications,
    removeNotification,
    acceptInvitation,
    declineInvitation,
  };
}