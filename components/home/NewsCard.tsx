import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { APP_THEME } from "@/constants/themes";

export default function NewsCard({
  data,
  onVerMas = () => {},
}: {
  data: { title: string; summary: string; affectsLabel: string } | null;
  onVerMas: () => void;
}) {
  if (!data) return null;

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
      <View
        style={[
          styles.header,
          { backgroundColor: APP_THEME.background.primary },
        ]}
      >
        <Ionicons
          name="newspaper-outline"
          size={18}
          color={APP_THEME.cards.news.accent}
        />
        <Text
          style={[styles.headerText, { color: APP_THEME.cards.news.accent }]}
        >
          Noticia del Dia
        </Text>
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

        <View style={styles.tag}>
          <Ionicons
            name="trending-up"
            size={16}
            color={APP_THEME.cards.news.accent}
          />
          <Text
            style={[styles.tagText, { color: APP_THEME.cards.news.accent }]}
          >
            {data.affectsLabel}
          </Text>
        </View>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
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
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  tagText: {
    fontSize: 14,
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
