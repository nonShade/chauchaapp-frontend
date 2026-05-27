import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { APP_THEME } from "@/constants/themes";
import { useNotifications } from "@/hooks/useNotification";
import { Notification } from "@/types/notification";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MODAL_WIDTH = SCREEN_WIDTH * 0.82;

interface NotificationsPanelProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Tipos y su configuración visual ─────────────────────────────────────────
// notification_type values from DB:
//   group_join_request | group_join_accepted | group_join_rejected
//   transaction_reminder | system_info | educational_reminder

// ─── Item: group_join_request ─────────────────────────────────────────────────
function GroupJoinRequestItem({
  item,
  onAccept,
  onDecline,
}: {
  item: Notification;
  onAccept: (invitationId: string, notificationId: string) => void;
  onDecline: (invitationId: string, notificationId: string) => void;
}) {
  return (
    <View style={[styles.item, styles.itemGroupRequest]}>
      <View style={styles.itemHeader}>
        <View style={{ padding: 4, backgroundColor: "rgb(6, 32, 25)", borderRadius: 1000 }}>
            <Ionicons name="people-outline" size={24} color="rgb(32, 163, 83)" />
        </View>
        <Text style={[styles.itemLabel, { color: "#fff" }]}>
          Solicitud de grupo familiar
        </Text>
      </View>
      <Text style={styles.itemMessage}>{item.message}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.joinBtn]}
          onPress={() => onAccept(item.reference_id, item.notification_id)}
        >
          <Ionicons name="checkmark" size={14} color="#000" />
          <Text style={styles.joinBtnText}>Unirse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.declineBtn]}
          onPress={() => onDecline(item.reference_id, item.notification_id)}
        >
          <Ionicons name="close" size={14} color="#64748b" />
          <Text style={styles.declineBtnText}>No me interesa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Item genérico (group_join_accepted, group_join_rejected,
//     transaction_reminder, system_info, educational_reminder) ────────────────
const GENERIC_CONFIG: Record<
  string,
  { icon: string; color: string; bg: string; border: string; label: string }
> = {
  group_join_accepted: {
    icon: "checkmark-circle-outline",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#86efac",
    label: "Solicitud aceptada",
  },
  group_join_rejected: {
    icon: "close-circle-outline",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fca5a5",
    label: "Solicitud rechazada",
  },
  transaction_reminder: {
    icon: "calendar-outline",
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#c4b5fd",
    label: "Recordatorio",
  },
  system_info: {
    icon: "information-circle-outline",
    color: "#0369a1",
    bg: "#f0f9ff",
    border: "#7dd3fc",
    label: "Información",
  },
  educational_reminder: {
    icon: "school-outline",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fcd34d",
    label: "Módulo educativo",
  },
};

const FALLBACK_CONFIG = {
  icon: "notifications-outline",
  color: "#475569",
  bg: "#f8fafc",
  border: "#cbd5e1",
  label: "Notificación",
};

function GenericItem({
  item,
  onDelete,
}: {
  item: Notification;
  onDelete: (id: string) => void;
}) {
  const cfg = GENERIC_CONFIG[item.notification_type] ?? FALLBACK_CONFIG;

  return (
    <View
      style={[
        styles.item,
        {
          backgroundColor: cfg.bg,
          borderLeftWidth: 3,
          borderLeftColor: cfg.border,
          borderWidth: 1,
          borderColor: cfg.border,
        },
      ]}
    >
      <View style={styles.itemHeader}>
        <Ionicons name={cfg.icon as any} size={16} color={cfg.color} />
        <Text style={[styles.itemLabel, { color: cfg.color }]}>{cfg.label}</Text>
        <TouchableOpacity
          onPress={() => onDelete(item.notification_id)}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={14} color="#94a3b8" />
        </TouchableOpacity>
      </View>
      <Text style={styles.itemMessage}>{item.message}</Text>
    </View>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
export default function NotificationsPanel({
  visible,
  onClose,
}: NotificationsPanelProps) {
  const {
    notifications,
    loading,
    error,
    loadNotifications,
    removeNotification,
    acceptInvitation,
    declineInvitation,
  } = useNotifications();

  const slideAnim = useRef(new Animated.Value(MODAL_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      loadNotifications();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MODAL_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // group_join_request primero, el resto después
  const sorted = [...notifications].sort((a, b) => {
    if (
      a.notification_type === "group_join_request" &&
      b.notification_type !== "group_join_request"
    )
      return -1;
    if (
      a.notification_type !== "group_join_request" &&
      b.notification_type === "group_join_request"
    )
      return 1;
    return 0;
  });

  const renderItem = ({ item }: { item: Notification }) => {
    if (item.notification_type === "group_join_request") {
      return (
        <GroupJoinRequestItem
          item={item}
          onAccept={acceptInvitation}
          onDecline={declineInvitation}
        />
      );
    }
    return <GenericItem item={item} onDelete={removeNotification} />;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}
      >
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Notificaciones</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={APP_THEME.text.primary} />
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator style={{ marginTop: 32 }} color={APP_THEME.text.primary} />
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!loading && !error && sorted.length === 0 && (
          <Text style={styles.emptyText}>Sin notificaciones nuevas</Text>
        )}
        {!loading && sorted.length > 0 && (
          <FlatList
            data={sorted}
            keyExtractor={(item) => item.notification_id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </Modal>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  panel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: MODAL_WIDTH,
    backgroundColor: APP_THEME.card?.background ?? "#f9fafb",
    paddingTop: 16,
    paddingHorizontal: 14,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: -3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: APP_THEME.text.primary,
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  // ── Base item ──
  item: {
    width: "100%",
    borderRadius: 10,
    padding: 12,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  itemLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  itemMessage: {
    fontSize: 13,
    color: APP_THEME.text.secondary ?? "#64748b",
    lineHeight: 18,
  },
  deleteBtn: {
    padding: 2,
  },
  // ── group_join_request ──
  itemGroupRequest: {
    backgroundColor: "rgb(4, 16, 17)",
    borderWidth: 1,
    borderColor: "rgb(6, 41, 29)",
    borderRadius: 10,
  },
  // ── Botones de acción ──
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 7,
    borderRadius: 7,
  },
  joinBtn: {
    backgroundColor: "rgb(32, 163, 83)",
  },
  joinBtnText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 13,
  },
  declineBtn: {
    backgroundColor: "rgb(13, 23, 26)",
    borderWidth: 1,
    borderColor: "rgb(26, 32, 39)",
  },
  declineBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  // ── Estados ──
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    color: APP_THEME.text.secondary ?? "#94a3b8",
    fontSize: 14,
  },
  errorText: {
    textAlign: "center",
    marginTop: 32,
    color: "#ef4444",
    fontSize: 13,
  },
});