import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { APP_THEME } from "@/constants/themes";

export default function Header({ userName = "Usuario" }) {
  const router = useRouter();
  const initials = userName.substring(0, 1).toUpperCase();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileSection}
        onPress={() => router.push("/profile")}
      >
        <View style={[styles.avatar, { backgroundColor: APP_THEME.button.primary.background }]}>
          <Text style={[styles.avatarText, { color: APP_THEME.button.primary.text }]}>{initials}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.greeting, { color: APP_THEME.text.secondary }]}>{getGreeting()}</Text>
          <Text style={[styles.userName, { color: APP_THEME.text.primary }]}>{userName}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.notificationBtn}>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={APP_THEME.text.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  textBlock: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationBtn: {
    padding: 4,
  },
});
