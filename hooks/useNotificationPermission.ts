import { useState, useEffect, useCallback } from "react";
import { Platform, Alert } from "react-native";

// expo-notifications solo disponible en entorno nativo
let Notifications: typeof import("expo-notifications") | null = null;
try {
  if (Platform.OS !== "web") {
    Notifications = require("expo-notifications");
  }
} catch {
  // no disponible en web
}

export interface PushPayload {
  title: string;
  body:  string;
}

export interface UseNotificationPermissionReturn {
  /** true si el usuario ya concedió permiso */
  granted: boolean;
  /** Solicita permiso al usuario (muestra el diálogo del SO / browser) */
  requestPermission: () => Promise<boolean>;
  /** Dispara una notificación push local */
  sendPush: (payload: PushPayload) => Promise<void>;
}

export function useNotificationPermission(): UseNotificationPermissionReturn {
  const [granted, setGranted] = useState(false);

  // ── Chequeo inicial de permiso ya existente ──────────────────────────────
  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") {
        if ("Notification" in window) {
          setGranted(Notification.permission === "granted");
        }
      } else if (Notifications) {
        const { status } = await Notifications.getPermissionsAsync();
        setGranted(status === "granted");
      }
    })();
  }, []);

  // ── Solicitar permiso ────────────────────────────────────────────────────
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") {
      if (!("Notification" in window)) return false;

      if (Notification.permission === "granted") {
        setGranted(true);
        return true;
      }

      if (Notification.permission === "denied") {
        return false;
      }

      const result = await Notification.requestPermission();
      const ok = result === "granted";
      setGranted(ok);
      return ok;
    }

    // Móvil (Expo)
    if (!Notifications) return false;

    // En Android 13+ hay que crear un canal primero
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name:       "Notificaciones",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#20A353",
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    const ok = status === "granted";
    setGranted(ok);

    if (!ok) {
      Alert.alert(
        "Notificaciones desactivadas",
        "Puedes activarlas desde Configuración > Notificaciones."
      );
    }

    return ok;
  }, []);

  // ── Disparar una push local ──────────────────────────────────────────────
  const sendPush = useCallback(
    async ({ title, body }: PushPayload): Promise<void> => {
      if (!granted) return;

      if (Platform.OS === "web") {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        new Notification(title, { body, icon: "/assets/icon.png" });
        return;
      }

      if (!Notifications) return;

      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null, // inmediata
      });
    },
    [granted]
  );

  return { granted, requestPermission, sendPush };
}