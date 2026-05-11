import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APP_THEME } from "@/constants/themes";

// Color palette para categorías
const COLOR_PALETTE = [
  { bg: "#1a3a1a", text: "#66ff66" }, // Verde
  { bg: "#3a3a1a", text: "#ffcc44" }, // Amarillo
  { bg: "#2a1a3a", text: "#ff66ff" }, // Morado
  { bg: "#3a2a1a", text: "#ffaa55" }, // Naranja
  { bg: "#1a2a3a", text: "#55aaff" }, // Azul
  { bg: "#3a1a1a", text: "#ff5555" }, // Rojo
  { bg: "#2a3a1a", text: "#88ff66" }, // Verde claro
  { bg: "#1a3a2a", text: "#55ffaa" }, // Turquesa
  { bg: "#2a1a2a", text: "#ff88ff" }, // Rosa
  { bg: "#3a3a1a", text: "#ffff55" }, // Amarillo claro
];

const CATEGORY_ICONS: Record<string, string> = {
  "Salario Base": "wallet",
  Commodities: "trending-up",
  Impuestos: "receipt",
  PYME: "briefcase",
  Logistica: "car",
  Monetaria: "logo-usd",
  Economia: "stats-chart",
};

// Hash function para generar índice consistente
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % COLOR_PALETTE.length;
}

function getCategoryColor(category: string) {
  const index = hashString(category);
  return COLOR_PALETTE[index];
}

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] || "tag";
}

function getUrgencyIcon(urgency: string) {
  switch (urgency) {
    case "alto":
      return "alert-circle";
    case "medio":
      return "alert";
    case "bajo":
      return "checkmark-circle";
    default:
      return "help-circle";
  }
}

function getUrgencyColor(urgency: string) {
  switch (urgency) {
    case "alto":
      return "#ff5555";
    case "medio":
      return "#ffaa55";
    case "bajo":
      return "#66ff66";
    default:
      return "#aaaaaa";
  }
}

export default function NewsCard({
  data,
  onVerMas = () => {},
}: {
  data: {
    title: string;
    summary: string;
    affectsLabel: string;
    etiquetas?: string[];
    nivel_urgencia?: string;
    published_at?: string;
  } | null;
  onVerMas: () => void;
}) {
  if (!data) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-CL", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: APP_THEME.cards.news.background,
          borderColor: APP_THEME.cards.news.border,
        },
      ]}
    >
      {/* Impact and Date Header */}
      <View style={styles.headerTop}>
        {data.nivel_urgencia && (
          <View
            style={[
              styles.impactBadge,
              {
                backgroundColor:
                  data.nivel_urgencia === "alto"
                    ? "#3a1a1a"
                    : data.nivel_urgencia === "medio"
                    ? "#3a2a1a"
                    : "#1a3a1a",
              },
            ]}
          >
            <Ionicons
              name={getUrgencyIcon(data.nivel_urgencia)}
              size={14}
              color={getUrgencyColor(data.nivel_urgencia)}
            />
            <Text
              style={[
                styles.impactBadgeText,
                { color: getUrgencyColor(data.nivel_urgencia) },
              ]}
            >
              {data.nivel_urgencia === "alto"
                ? "Impacto alto"
                : data.nivel_urgencia === "medio"
                ? "Impacto medio"
                : "Impacto bajo"}
            </Text>
          </View>
        )}
        {data.published_at && (
          <Text style={styles.dateText}>{formatDate(data.published_at)}</Text>
        )}
      </View>

      <View style={styles.body}>
        <Text
          style={[styles.title, { color: APP_THEME.cards.news.text }]}
          numberOfLines={2}
        >
          {data.title}
        </Text>
        <Text
          style={[styles.description, { color: APP_THEME.text.secondary }]}
          numberOfLines={3}
        >
          {data.summary}
        </Text>

        {/* Categorías/Etiquetas con colores dinámicos */}
        {data.etiquetas && data.etiquetas.length > 0 && (
          <View style={styles.tagsContainer}>
            {data.etiquetas.slice(0, 3).map((tag, idx) => {
              const color = getCategoryColor(tag);
              return (
                <View
                  key={idx}
                  style={[
                    styles.categoryTag,
                    { backgroundColor: color.bg },
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(tag)}
                    size={12}
                    color={color.text}
                  />
                  <Text style={[styles.categoryTagText, { color: color.text }]}>
                    {tag}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity onPress={onVerMas} style={styles.linkRow}>
          <Text
            style={[styles.linkText, { color: APP_THEME.cards.news.accent }]}
          >
            Ver mas noticias
          </Text>
          <Ionicons
            name="open-outline"
            size={16}
            color={APP_THEME.cards.news.accent}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 0,
    marginVertical: 10,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dateText: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
    fontWeight: "500",
  },
  impactBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  impactBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  body: {
    padding: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
