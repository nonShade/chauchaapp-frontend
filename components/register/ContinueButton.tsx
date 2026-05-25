import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { APP_THEME } from "@/constants/themes";
 
type Props = {
  step: number;
  onNext: () => void;
  onRegister: () => void;
};
 
export default function ContinueButton({ step, onNext, onRegister }: Props) {
  const router = useRouter();
 
  const primary = APP_THEME.button.primary.background;
  const background = APP_THEME.background.primary;
  const foreground = APP_THEME.text.primary;
  const border = APP_THEME.input.border;
 
  return (
    <View
      style={[
        styles.footer,
        { backgroundColor: background, borderColor: border },
      ]}
    >
      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: primary }]}
        onPress={step < 3 ? onNext : onRegister}
      >
        <Text style={[styles.navButtonText, { color: background }]}>
          {step < 3 ? "Siguiente" : "Crear cuenta"}
        </Text>
      </TouchableOpacity>
 
      {step === 1 && (
        <Text
          style={[
            styles.loginLink,
            { color: foreground },
          ]}
        >
          ¿Ya tienes cuenta?{" "}
          <Text
            style={{ color: primary }}
            onPress={() => router.replace("/login")}
          >
            Inicia sesión
          </Text>
        </Text>
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    padding: 12,
    paddingBottom: 12,
    gap: 15,
  },
  navButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  loginLink: {
    textAlign: "center",
    fontSize: 16,
  },
});