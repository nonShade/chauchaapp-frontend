import { useState, useCallback, useRef } from "react";
import * as SecureStore from 'expo-secure-store';
import { Notification } from "@/types/notification";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchNotifications,
  deleteNotification,
  acceptGroupInvitation,
  declineGroupInvitation,
} from "@/services/api/notifications";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { getMeta } from "@/constants/notificationConfig";
import { DEBUG_NOTIFICATIONS } from "@/constants/debugNotifications";

const STORAGE_KEY = "debug_notifications_seen";

// Lee los seen_at guardados y los aplica sobre las notificaciones debug base
async function loadDebugNotifications(): Promise<Notification[]> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    const seenMap: Record<string, string> = raw ? JSON.parse(raw) : {};
    return DEBUG_NOTIFICATIONS.map((n) => ({
      ...n,
      seen_at: seenMap[n.notification_id] ?? n.seen_at,
    }));
  } catch {
    return DEBUG_NOTIFICATIONS;
  }
}

// Guarda el seen_at de una notificación debug
async function saveDebugSeen(id: string, seenAt: string): Promise<void> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    const seenMap: Record<string, string> = raw ? JSON.parse(raw) : {};
    seenMap[id] = seenAt;
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(seenMap));
  } catch {}
}

// Borra todos los seen_at guardados (reset a "nuevas")
export async function resetDebugNotifications(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

// Merge debug + backend sin duplicados
function mergeNotifications(debug: Notification[], backend: Notification[]): Notification[] {
  return [...debug, ...backend].filter(
    (item, index, self) =>
      index === self.findIndex((n) => n.notification_id === item.notification_id)
  );
}

export interface UseNotificationsReturn {
  notifications:         Notification[];
  loading:               boolean;
  error:                 string | null;
  pushGranted:           boolean;
  requestPushPermission: () => Promise<boolean>;
  loadNotifications:     () => Promise<void>;
  removeNotification:    (notificationId: string) => Promise<void>;
  acceptInvitation:      (invitationId: string, notificationId: string) => Promise<void>;
  declineInvitation:     (invitationId: string, notificationId: string) => Promise<void>;
  markAllAsSeen:         () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const notifiedIds                       = useRef<Set<string>>(new Set());

  const { granted: pushGranted, requestPermission, sendPush } =
    useNotificationPermission();

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

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [debugData, backendData] = await Promise.all([
        loadDebugNotifications(),
        fetchNotifications(accessToken),
      ]);
      const merged = mergeNotifications(debugData, backendData);
      setNotifications(merged);
      await pushNewNotifications(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  }, [accessToken, pushNewNotifications]);

  const removeNotification = useCallback(
    async (notificationId: string) => {
      try {
        if (!notificationId.startsWith("debug-")) {
          await deleteNotification(notificationId, accessToken);
        }
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar notificación");
      }
    },
    [accessToken]
  );

  const acceptInvitation = useCallback(
    async (invitationId: string, notificationId: string) => {
      try {
        if (!notificationId.startsWith("debug-")) {
          await acceptGroupInvitation(invitationId, accessToken);
          await deleteNotification(notificationId, accessToken);
        }
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al aceptar invitación");
      }
    },
    [accessToken]
  );

  const declineInvitation = useCallback(
    async (invitationId: string, notificationId: string) => {
      try {
        if (!notificationId.startsWith("debug-")) {
          await declineGroupInvitation(invitationId, accessToken);
          await deleteNotification(notificationId, accessToken);
        }
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al rechazar invitación");
      }
    },
    [accessToken]
  );

  const markAllAsSeen = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => {
        if (!n.seen_at) {
          if (n.notification_id.startsWith("debug-")) {
            saveDebugSeen(n.notification_id, now);
          }
          return { ...n, seen_at: now };
        }
        return n;
      })
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