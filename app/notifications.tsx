import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  ViewStyle,
  TextStyle,
  Animated,
} from "react-native";
import { useEffect } from "react";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { APP_THEME } from "@/constants/themes";
import { useNotifications } from "@/hooks/useNotification";
import { Notification } from "@/types/notification";
import {
  getMeta,
  getCategory,
  NOTIFICATION_TYPES,
} from "@/constants/notificationConfig";

// ─── Colores del tema ─────────────────────────────────────────────────────────
const COLORS = {
  bg:          (typeof APP_THEME.background === "string"
                  ? APP_THEME.background
                  : "#06090f") as string,
  textPrimary: (APP_THEME.text?.primary   ?? "#f1f5f9") as string,
  textSecond:  (APP_THEME.text?.secondary ?? "#64748b") as string,
  cardBorder:  (APP_THEME.card?.border    ?? "#1e293b") as string,
} as const;

// ─── Paleta de colores ────────────────────────────────────────────────────────
const C = {
  // Grupos / invitaciones
  groupBg:        "#0a1912",
  groupBorder:    "#0d2b1c",
  groupBadgeBg:   "#0d2b1c",
  groupAccent:    "#20a353",

  // Tips / educacional
  tipBg:          "#10141b",
  tipBorder:      "#292e36",
  tipBadgeBg:     "#1d2229",
  tipAccent:      "#ffffff",

  // Recordatorios (paleta naranja fija)
  recBg:          "#ff98451a",
  recBorder:      "#ff984540",
  recBadgeBg:     "#ff984526",
  recAccent:      "#ff9845",

  // Otras notificaciones (system_info, unknown)
  // color-mix(chart-2 10%, #06090f)
  otherBg:        "#0a1912",
  otherBorder:    "#0d2b1c",
  otherBadgeBg:   "#0d2b1c",
  otherAccent:    "#00a3cd",

  // Texto de mensaje
  msgText:        "#8b8f95",

  // Badge "Nuevo" — fondo/letra igual al icono de grupos
  newBadgeBg:     "#0d2b1c",
  newBadgeText:   "#20a353",
} as const;

// ─── DEBUG: Notificaciones de prueba ─────────────────────────────────────────
// TODO: eliminar cuando el backend genere notificaciones reales.
const now = Date.now();
const DEBUG_NOTIFICATIONS: Notification[] = [
  // ── Invitaciones ──
  {
    notification_id: "debug-1", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.GROUP_JOIN_REQUEST,
    notification_status: "pending",
    message: "[DEBUG] María López te ha invitado a unirte al grupo familiar López 2024.",
    scheduled_date: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "inv-debug-001", reference_type: "invitation", seen_at: null,
  },
  // ── Próximos gastos (recordatorios) ──
  {
    notification_id: "debug-7", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.TRANSACTION_REMINDER,
    notification_status: "read",
    message: "[DEBUG] En 3 días vence tu gasto \"Dividendo Departamento\" por $420.000 (23 de abril). Revisa tu saldo.",
    scheduled_date: new Date(now - 41 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "tx-debug-007", reference_type: "transaction", seen_at: new Date().toISOString(),
  },
  {
    notification_id: "debug-8", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.TRANSACTION_REMINDER,
    notification_status: "unread",
    message: "[DEBUG] Esta semana tienes un gasto programado: \"TAG autopista\" por $35.000 el 25 de abril.",
    scheduled_date: new Date(now - 42 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "tx-debug-008", reference_type: "transaction", seen_at: null,
  },
  // ── Otras notificaciones ──
  {
    notification_id: "debug-6", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.SYSTEM_INFO,
    notification_status: "unread",
    message: "[DEBUG] ChauchaApp se actualizó a la versión 2.1.0. Revisa las novedades en el menú principal.",
    scheduled_date: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "", reference_type: "system", seen_at: null,
  },
  {
    notification_id: "debug-5", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.EDUCATIONAL,
    notification_status: "unread",
    message: "[DEBUG] Nuevo módulo disponible: Inversión para principiantes. ¡Aprende a hacer crecer tu dinero!",
    scheduled_date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "module-debug-005", reference_type: "educational_module", seen_at: null,
  },
  // Solo 1 tip
  {
    notification_id: "debug-4", user_id: "debug",
    notification_type: NOTIFICATION_TYPES.TIP,
    notification_status: "unread",
    message: "[DEBUG] Ahorra al menos el 20% de tus ingresos mensuales para crear un fondo de emergencia.",
    scheduled_date: new Date(now - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    reference_id: "", reference_type: "tip", seen_at: null,
  },
];

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
  const badgeBg   = badgeVariant === "reminder" ? C.recBadgeBg
                  : badgeVariant === "tip"       ? C.tipBadgeBg
                  : C.newBadgeBg;
  const badgeTxt  = badgeVariant === "reminder" ? C.recAccent
                  : badgeVariant === "tip"       ? C.tipAccent
                  : C.newBadgeText;
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
        <View style={[styles.iconBadge, { backgroundColor: C.groupBadgeBg } as ViewStyle]}>
          <Ionicons name={meta.icon} size={22} color={C.groupAccent} />
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
          style={[styles.actionBtn, { backgroundColor: C.groupAccent } as ViewStyle]}
          onPress={() => onAccept(item.reference_id, item.notification_id)}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
          <Text style={[styles.actionBtnText, { color: "#fff" } as TextStyle]}>Unirse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.declineBtn]}
          onPress={() => onDecline(item.reference_id, item.notification_id)}
        >
          <Ionicons name="close" size={16} color="#94a3b8" />
          <Text style={[styles.actionBtnText, { color: "#94a3b8" } as TextStyle]}>No me interesa</Text>
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

  const bg          = isTip ? C.tipBg      : isReminder ? C.recBg      : C.otherBg;
  const border      = isTip ? C.tipBorder  : isReminder ? C.recBorder  : C.otherBorder;
  const badgeBg     = isTip ? C.tipBadgeBg : isReminder ? C.recBadgeBg : C.otherBadgeBg;
  const accentColor = isTip ? C.tipAccent  : isReminder ? C.recAccent  : C.otherAccent;

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
          <Ionicons name="close" size={18} color="#94a3b8" />
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

  // DEBUG: anteponer debug a las del backend
  // TODO: eliminar DEBUG_NOTIFICATIONS cuando el backend esté listo
  const allNotifications = [...DEBUG_NOTIFICATIONS, ...notifications];
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

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
      </View>

      {/* ── Contenido ── */}
      {loading && (
        <ActivityIndicator style={styles.centered} size="large" color={COLORS.textPrimary} />
      )}

      {!loading && !!error && (
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={44} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadNotifications}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && sections.length === 0 && (
        <View style={styles.centered}>
          <Ionicons name="notifications-off-outline" size={52} color="#475569" />
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
    backgroundColor: COLORS.bg,
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
    fontSize:   24,
    fontWeight: "700",
    color:      COLORS.textPrimary,
    textAlign:  "left",
  },
  headerUnread: {
    fontSize:  16,
    color:     COLORS.textSecond,
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
    fontSize:      15,
    fontWeight:    "700",
    letterSpacing: 0.8,
    color:         COLORS.textSecond,
    textTransform: "uppercase",
  },
  // ── Ítem base ──
  item: {
    borderRadius: 14,
    borderWidth:  2,
    padding:      16,
  },
  itemGroup: {
    backgroundColor: C.groupBg,
    borderColor:     C.groupBorder,
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
    fontSize:   17,
    fontWeight: "600",
  },
  itemMessage: {
    fontSize:   16,
    lineHeight: 24,
    color:      C.msgText,
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
    fontSize: 14,
    color:    C.msgText,
  },
  newBadge: {
    paddingHorizontal: 10,
    paddingVertical:   3,
    borderRadius:      20,
  },
  newBadgeText: {
    fontSize:   13,
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
    borderColor:     "#334155",
  },
  actionBtnText: {
    fontSize:   15,
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
    fontSize:  18,
    color:     "#475569",
    textAlign: "center",
  },
  errorText: {
    fontSize:  16,
    color:     "#ef4444",
    textAlign: "center",
  },
  retryBtn: {
    marginTop:         8,
    paddingVertical:   12,
    paddingHorizontal: 28,
    borderRadius:      9,
    backgroundColor:   "#1e293b",
  },
  retryBtnText: {
    color:      COLORS.textPrimary,
    fontWeight: "600",
    fontSize:   16,
  },
});