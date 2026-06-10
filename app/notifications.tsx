import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  StatusBar,
  Alert,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "@/hooks/useNotification";
import { Notification } from "@/types/notification";
import {
  getMeta,
  getCategory,
} from "@/constants/notificationConfig";
import { APP_THEME, Typography } from "@/constants/themes";

const resetDebugNotifications: (() => Promise<void>) | null = __DEV__
  ? require("@/hooks/useNotification.dev").resetDebugNotifications
  : null;

// ─── Paleta de colores ────────────────────────────────────────────────────────
const COLORS = APP_THEME.notifications;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Hoy";
  if (diff === 1) return "Hace 1 día";
  return `Hace ${diff} días`;
}

function HighlightedMessage({ message, accentColor, baseStyle }: {
  message:     string;
  accentColor: string;
  baseStyle:   TextStyle;
}) {
  const parts = message.split(/(\b[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+(?:\s[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+)*\b)/g);
  return (
    <Text style={baseStyle}>
      {parts.map((part, i) =>
        /^[A-ZÁÉÍÓÚÜÑ]/.test(part) && part.length > 2
          ? <Text key={i} style={{ color: accentColor, fontWeight: "600" }}>{part}</Text>
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
}

function TimeRow({ item, isNew, badgeVariant }: {
  item:         Notification;
  isNew:        boolean;
  badgeVariant: "group" | "reminder" | "tip" | "other";
}) {
  const badgeBg   = badgeVariant === "reminder" ? COLORS.reminderBadgeBg
                  : badgeVariant === "tip"       ? COLORS.tipBadgeBg
                  : COLORS.newBadgeBg;
  const badgeTxt  = badgeVariant === "reminder" ? COLORS.reminderAccent
                  : badgeVariant === "tip"       ? COLORS.tipAccent
                  : COLORS.newBadgeText;
  return (
    <View style={styles.timeRow}>
      <Text style={styles.timeText}>{daysAgo(item.scheduled_date)}</Text>
      {isNew && (
        <View style={[styles.newBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.newBadgeText, { color: badgeTxt }]}>Nuevo</Text>
        </View>
      )}
    </View>
  );
}

// ─── Ítem: invitación a grupo ─────────────────────────────────────────────────
function ActionItem({ item, onAccept, onDecline }: {
  item:      Notification;
  onAccept:  (invitationId: string, notificationId: string) => void;
  onDecline: (invitationId: string, notificationId: string) => void;
}) {
  const meta  = getMeta(item.notification_type);
  const isNew = !item.seen_at;

  return (
    <View style={[styles.item, styles.itemGroup]}>
      <View style={styles.itemHeader}>
        <View style={[styles.iconBadge, { backgroundColor: COLORS.groupBadgeBg } as ViewStyle]}>
          <Ionicons name={meta.icon} size={22} color={COLORS.groupAccent} />
        </View>
        <Text style={[styles.itemLabel, { color: "#ffffff" } as TextStyle]}>{meta.label}</Text>
      </View>

      <HighlightedMessage
        message={item.message}
        accentColor="#ffffff"
        baseStyle={styles.itemMessage}
      />

      <TimeRow item={item} isNew={isNew} badgeVariant="group" />

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.groupAccent } as ViewStyle]}
          onPress={() => onAccept(item.reference_id, item.notification_id)}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
          <Text style={[styles.actionBtnText, { color: "#fff" } as TextStyle]}>Unirse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.declineBtn]}
          onPress={() => onDecline(item.reference_id, item.notification_id)}
        >
          <Ionicons name="close" size={16} color={APP_THEME.notifications.mutedText} />
          <Text style={[styles.actionBtnText, { color: APP_THEME.notifications.mutedText } as TextStyle]}>No me interesa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Ítem: genérico ───────────────────────────────────────────────────────────
function GenericItem({ item, onDelete }: {
  item:     Notification;
  onDelete: (id: string) => void;
}) {
  const meta       = getMeta(item.notification_type);
  const category   = getCategory(item.notification_type);
  const isNew      = !item.seen_at;
  const isTip      = category === "tip";
  const isReminder = category === "reminder";

  const bg          = isTip ? COLORS.tipBg      : isReminder ? COLORS.reminderBg      : COLORS.otherBg;
  const border      = isTip ? COLORS.tipBorder  : isReminder ? COLORS.reminderBorder  : COLORS.otherBorder;
  const badgeBg     = isTip ? COLORS.tipBadgeBg : isReminder ? COLORS.reminderBadgeBg : COLORS.otherBadgeBg;
  const accentColor = isTip ? COLORS.tipAccent  : isReminder ? COLORS.reminderAccent  : COLORS.otherAccent;

  const badgeVariant: "reminder" | "tip" | "other" =
    isReminder ? "reminder" : isTip ? "tip" : "other";

  // Tips usan el mismo icono que las notificaciones genéricas
  const iconName = isTip ? "notifications-outline" : meta.icon;

  const itemStyle: ViewStyle  = { ...styles.item,      backgroundColor: bg,     borderColor: border };
  const badgeStyle: ViewStyle = { ...styles.iconBadge, backgroundColor: badgeBg };

  return (
    <View style={itemStyle}>
      <View style={styles.itemHeader}>
        <View style={badgeStyle}>
          <Ionicons name={iconName} size={20} color={accentColor} />
        </View>
        <Text style={[styles.itemLabel, { color: "#ffffff" } as TextStyle]}>{meta.label}</Text>
        <TouchableOpacity
          onPress={() => onDelete(item.notification_id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.deleteBtn}
        >
          <Ionicons name="close" size={18} color={APP_THEME.notifications.mutedText} />
        </TouchableOpacity>
      </View>

      <Text style={styles.itemMessage}>{item.message}</Text>

      <TimeRow item={item} isNew={isNew} badgeVariant={badgeVariant} />
    </View>
  );
}

// ─── Secciones ────────────────────────────────────────────────────────────────
// Orden fijo: Invitaciones → Próximos gastos → Otras notificaciones
const SECTION_ORDER = ["Invitaciones a grupos", "Próximos gastos", "Otras notificaciones"] as const;
type SectionTitle = typeof SECTION_ORDER[number];

function getSectionTitle(n: Notification): SectionTitle {
  const cat = getCategory(n.notification_type);
  if (cat === "group")    return "Invitaciones a grupos";
  if (cat === "reminder") return "Próximos gastos";
  return "Otras notificaciones"; // tip, system, educational, unknown
}

function buildSections(items: Notification[]) {
  const map: Record<SectionTitle, Notification[]> = {
    "Invitaciones a grupos":   [],
    "Próximos gastos":         [],
    "Otras notificaciones":    [],
  };
  for (const n of items) {
    map[getSectionTitle(n)].push(n);
  }
  return SECTION_ORDER
    .filter((title) => map[title].length > 0)
    .map((title) => ({ title, data: map[title] }));
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    loading,
    error,
    pushGranted,
    requestPushPermission,
    loadNotifications,
    removeNotification,
    acceptInvitation,
    declineInvitation,
    markAllAsSeen,
  } = useNotifications();

  useEffect(() => {
    if (!pushGranted) {
      Alert.alert(
        "¿Activar notificaciones?",
        "Recibe alertas de recordatorios, invitaciones y consejos financieros.",
        [
          { text: "Ahora no", style: "cancel" },
          { text: "Activar", onPress: () => requestPushPermission() },
        ]
      );
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  useEffect(() => {
    if (notifications.length > 0) {
      markAllAsSeen();
    }
  }, [notifications, markAllAsSeen]);

  const allNotifications = [...notifications];
  const unreadCount      = allNotifications.filter((n) => !n.seen_at).length;
  const sections         = buildSections(allNotifications);

  const renderItem = ({ item }: { item: Notification }) => {
    const meta = getMeta(item.notification_type);
    if (meta.hasActions) {
      return <ActionItem item={item} onAccept={acceptInvitation} onDecline={declineInvitation} />;
    }
    return <GenericItem item={item} onDelete={removeNotification} />;
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerUnread}>
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={loadNotifications}
          style={styles.refreshBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="refresh-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        {__DEV__ && resetDebugNotifications && (
          <TouchableOpacity
            onPress={async () => {
              await resetDebugNotifications();
              await loadNotifications();
            }}
            style={styles.refreshBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="bug-outline" size={22} color="#f59e0b" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Contenido ── */}
      {loading && (
        <ActivityIndicator style={styles.centered} size="large" color={COLORS.textPrimary} />
      )}

      {!loading && !!error && (
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={44} color={APP_THEME.notifications.errorColor} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadNotifications}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && sections.length === 0 && (
        <View style={styles.centered}>
          <Ionicons name="notifications-off-outline" size={52} color={APP_THEME.notifications.emptyIcon} />
          <Text style={styles.emptyText}>Sin notificaciones nuevas</Text>
        </View>
      )}

      {!loading && !error && sections.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.notification_id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          SectionSeparatorComponent={() => <View style={{ height: 4 }} />}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex:            1,
    backgroundColor: COLORS.background,
    paddingTop:      Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 0,
  },
  header: {
    flexDirection:     "row",
    alignItems:        "center",
    paddingHorizontal: 16,
    paddingVertical:   14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap:               12,
  },
  backBtn:    { padding: 4 },
  refreshBtn: { padding: 4 },
  headerTextBlock: {
    flex: 1,
    gap:  3,
  },
  headerTitle: {
    fontSize:   Typography.xl,
    fontWeight: "700",
    color:      COLORS.textPrimary,
    textAlign:  "left",
  },
  headerUnread: {
    fontSize:  Typography.md,
    color:     COLORS.textSecondary,
    textAlign: "left",
  },
  // ── Secciones ──
  list: {
    paddingHorizontal: 16,
    paddingTop:        8,
    paddingBottom:     48,
  },
  sectionHeader: {
    paddingTop:    20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize:      Typography.label,
    fontWeight:    "700",
    letterSpacing: 0.8,
    color:         COLORS.textSecondary,
    textTransform: "uppercase",
  },
  // ── Ítem base ──
  item: {
    borderRadius: 14,
    borderWidth:  2,
    padding:      16,
  },
  itemGroup: {
    backgroundColor: COLORS.groupBg,
    borderColor:     COLORS.groupBorder,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           10,
    marginBottom:  10,
  },
  iconBadge: {
    width:          42,
    height:         42,
    borderRadius:   21,
    alignItems:     "center",
    justifyContent: "center",
  },
  itemLabel: {
    flex:       1,
    fontSize:   Typography.subhead,
    fontWeight: "600",
  },
  itemMessage: {
    fontSize:   Typography.md,
    lineHeight: 24,
    color:      COLORS.messageText,
  },
  deleteBtn: { padding: 4 },
  // ── Tiempo + badge ──
  timeRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           8,
    marginTop:     10,
  },
  timeText: {
    fontSize: Typography.base,
    color:    COLORS.messageText,
  },
  newBadge: {
    paddingHorizontal: 10,
    paddingVertical:   3,
    borderRadius:      20,
  },
  newBadgeText: {
    fontSize:   Typography.hint,
    fontWeight: "700",
  },
  // ── Botones de acción ──
  actionRow: {
    flexDirection: "row",
    gap:           8,
    marginTop:     12,
  },
  actionBtn: {
    flex:            1,
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "center",
    gap:             5,
    paddingVertical: 11,
    borderRadius:    9,
  },
  declineBtn: {
    backgroundColor: "transparent",
    borderWidth:     1,
    borderColor:     APP_THEME.notifications.declineBorder,
  },
  actionBtnText: {
    fontSize:   Typography.label,
    fontWeight: "600",
  },
  // ── Estados ──
  centered: {
    flex:              1,
    alignItems:        "center",
    justifyContent:    "center",
    gap:               14,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize:  Typography.body,
    color:     APP_THEME.notifications.emptyIcon,
    textAlign: "center",
  },
  errorText: {
    fontSize:  Typography.md,
    color:     APP_THEME.notifications.errorColor,
    textAlign: "center",
  },
  retryBtn: {
    marginTop:         8,
    paddingVertical:   12,
    paddingHorizontal: 28,
    borderRadius:      9,
    backgroundColor:   APP_THEME.notifications.retryBg,
  },
  retryBtnText: {
    color:      COLORS.textPrimary,
    fontWeight: "600",
    fontSize:   Typography.md,
  },
});