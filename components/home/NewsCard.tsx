import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PiggyBank } from "lucide-react-native";
import { APP_THEME } from "@/constants/themes";

const CATEGORY_COLOR = {
  bg: "#1a2a3a",
  text: "#55aaff",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Salario Base": "wallet",
  Commodities: "trending-up",
  Impuestos: "receipt",
  PYME: "briefcase",
  Logistica: "car",
  Monetaria: "logo-usd",
  Economia: "stats-chart",
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] || "tag";
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

function getUrgencyBackground(urgency: string) {
  switch (urgency) {
    case "alto":
      return "#3a1a1a";
    case "medio":
      return "#3a2a1a";
    case "bajo":
      return "#1a3a1a";
    default:
      return "#242424";
  }
}

function getUrgencyLabel(urgency: string) {
  switch (urgency) {
    case "alto":
      return "Alto impacto";
    case "medio":
      return "Medio impacto";
    case "bajo":
      return "Bajo impacto";
    default:
      return "Impacto";
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
                backgroundColor: getUrgencyBackground(data.nivel_urgencia),
              },
            ]}
          >
            <PiggyBank
              size={14}
              color={getUrgencyColor(data.nivel_urgencia)}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.impactBadgeText,
                { color: getUrgencyColor(data.nivel_urgencia) },
              ]}
            >
              {getUrgencyLabel(data.nivel_urgencia)}
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

        {/* Categorías/Etiquetas con color unificado */}
        {data.etiquetas && data.etiquetas.length > 0 && (
          <View style={styles.tagsContainer}>
            {data.etiquetas.slice(0, 3).map((tag, idx) => {
              return (
                <View
                  key={idx}
                  style={[
                    styles.categoryTag,
                    { backgroundColor: CATEGORY_COLOR.bg },
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(tag)}
                    size={12}
                    color={CATEGORY_COLOR.text}
                  />
                  <Text
                    style={[
                      styles.categoryTagText,
                      { color: CATEGORY_COLOR.text },
                    ]}
                  >
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
    paddingHorizontal: 8,
    borderRadius: 999,
    justifyContent: "center",
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
