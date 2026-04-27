import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { APP_THEME } from "@/constants/themes";
import NewsCard from "@/components/home/NewsCard";
import TipCard from "@/components/home/TipCard";

const formatCLP = (amount: number) => `$${amount.toLocaleString("es-CL")}`;

export default function HomeScreen() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);

  const balance = 573000;
  const ingresos = 3975000;
  const gastos = 3402000;
  const news = {
    title: "El cobre experimenta una leve alza",
    summary:
      "Los mercados reaccionan positivamente a las noticias desde Asia, impulsando el precio.",
    affectsLabel: "Impacto Positivo",
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: APP_THEME.background.primary }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View
          style={[
            styles.balanceContainer,
            { backgroundColor: APP_THEME.button.primary.background },
          ]}
        >
          <View style={styles.topSection}>
            <View style={styles.row}>
              <View style={styles.titleRow}>
                <Ionicons
                  name="sparkles-outline"
                  size={18}
                  color={APP_THEME.button.primary.text}
                />
                <Text
                  style={[
                    styles.balanceLabel,
                    { color: APP_THEME.button.primary.text },
                  ]}
                >
                  Balance disponible
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowBalance(!showBalance)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showBalance ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color={APP_THEME.button.primary.text}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.balanceAmount,
                { color: APP_THEME.button.primary.text },
              ]}
            >
              {showBalance ? formatCLP(balance) : "••••••••"}
            </Text>
          </View>

          <View style={styles.middleSection}>
            <View style={styles.col}>
              <View
                style={[
                  styles.iconBg,
                  { backgroundColor: APP_THEME.button.primary.text + "20" },
                ]}
              >
                <Ionicons
                  name="trending-up"
                  size={16}
                  color={APP_THEME.button.primary.text}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.colLabel,
                    { color: APP_THEME.button.primary.text },
                  ]}
                >
                  Ingresos
                </Text>
                <Text
                  style={[
                    styles.colAmount,
                    { color: APP_THEME.button.primary.text },
                  ]}
                >
                  {showBalance ? formatCLP(ingresos) : "••••"}
                </Text>
              </View>
            </View>
            <View style={styles.col}>
              <View
                style={[
                  styles.iconBg,
                  { backgroundColor: APP_THEME.button.primary.text + "20" },
                ]}
              >
                <Ionicons
                  name="trending-down"
                  size={16}
                  color={APP_THEME.button.primary.text}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.colLabel,
                    { color: APP_THEME.button.primary.text },
                  ]}
                >
                  Gastos
                </Text>
                <Text
                  style={[
                    styles.colAmount,
                    { color: APP_THEME.button.primary.text },
                  ]}
                >
                  {showBalance ? formatCLP(gastos) : "••••"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: APP_THEME.button.primary.text + "20" },
              ]}
              onPress={() => router.push("/(tabs)/wallet" as any)}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: APP_THEME.button.primary.text },
                ]}
              >
                Ver detalle completo
              </Text>
              <Ionicons
                name="arrow-up"
                size={16}
                color={APP_THEME.button.primary.text}
                style={{ transform: [{ rotate: "45deg" }] }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <NewsCard
          data={news}
          onVerMas={() => router.push("/(tabs)/news" as any)}
        />
        <TipCard tip="Destina el 20% de tus ingresos al ahorro. Crea un fondo de emergencia de 3-6 meses de gastos para mayor seguridad financiera." />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 32, paddingHorizontal: 16, gap: 16 },
  balanceContainer: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  topSection: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIcon: {
    padding: 4,
  },
  balanceLabel: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },
  middleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  col: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  colLabel: {
    fontSize: 13,
  },
  colAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    alignItems: "flex-start",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});
