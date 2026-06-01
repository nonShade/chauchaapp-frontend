import { Notification } from "@/types/notification";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function fetchNotifications(
  token: string | null
): Promise<Notification[]> {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener notificaciones: ${response.status}`);
  }

  return response.json();
}

export async function deleteNotification(
  notificationId: string,
  token: string | null
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/notifications/${notificationId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error al eliminar notificación: ${response.status}`);
  }
}

export async function acceptGroupInvitation(
  invitationId: string,
  token: string | null
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/family-group/invitation/accept`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ invitation_id: invitationId }),
    }
  );

  if (!response.ok) {
    throw new Error(`Error al aceptar invitación: ${response.status}`);
  }
}

export async function declineGroupInvitation(
  invitationId: string,
  token: string | null
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/family-group/invitation/decline`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ invitation_id: invitationId }),
    }
  );

  if (!response.ok) {
    throw new Error(`Error al rechazar invitación: ${response.status}`);
  }
}