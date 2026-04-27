import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { APP_THEME } from "@/constants/themes";

const LOGIN_COLORS = {
  background: APP_THEME.background.primary,
  cardBackground: APP_THEME.card.background,
  cardBorder: APP_THEME.card.border,
  textPrimary: APP_THEME.text.primary,
  textSecondary: APP_THEME.text.secondary,
  inputBackground: APP_THEME.input.background,
  inputBorder: APP_THEME.input.border,
  inputText: APP_THEME.input.text,
  buttonBackground: APP_THEME.button.primary.background,
  buttonText: APP_THEME.button.primary.text,
  error: APP_THEME.status.error,
  registerLink: APP_THEME.semantic.link,
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Validación de email
  const validateEmail = (value: string) => {
    if (!value) return "";
    // Regex simple para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Correo electrónico inválido";
    return "";
  };

  // Validación de contraseña
  const validatePassword = (value: string) => {
    if (!value) return "";
    return "";
  };

  const handleLogin = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    setLoginError("");
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrorEmail(emailErr);
    setErrorPassword(passErr);

    if (!email || !password) {
      setLoginError("Error al iniciar sesión");
      return;
    }

    if (emailErr || passErr) return;

    try {
      const response = await fetch("http://localhost:8000/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.access_token) {
        localStorage.setItem("token", data.access_token);
        router.replace("/(tabs)");
      } else {
        setLoginError("Error al iniciar sesión");
      }
    } catch {
      setLoginError("Error al iniciar sesión");
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: LOGIN_COLORS.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo-chauchapp.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: LOGIN_COLORS.textPrimary }]}>
            ChauchApp
          </Text>
          <Text
            style={[styles.appSubtitle, { color: LOGIN_COLORS.textSecondary }]}
          >
            Tu asistente financiero personal
          </Text>
        </View>

        {/* Form Card */}
        <View
          style={[
            styles.formCard,
            {
              backgroundColor: LOGIN_COLORS.cardBackground,
              borderColor: LOGIN_COLORS.cardBorder,
            },
          ]}
        >
          <Text style={[styles.formTitle, { color: LOGIN_COLORS.textPrimary }]}>
            Iniciar sesión
          </Text>
          <Text
            style={[styles.formSubtitle, { color: LOGIN_COLORS.textSecondary }]}
          >
            Ingresa con tu cuenta para continuar
          </Text>

          {/* Error Banner */}
          {loginError ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: LOGIN_COLORS.error + "20" },
              ]}
            >
              <View style={styles.errorBannerContent}>
                <AntDesign
                  name="exclamation-circle"
                  color={LOGIN_COLORS.error}
                  size={20}
                />
                <Text
                  style={[
                    styles.errorBannerText,
                    { color: LOGIN_COLORS.error },
                  ]}
                >
                  {loginError}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[styles.inputLabel, { color: LOGIN_COLORS.textPrimary }]}
            >
              Correo electrónico
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: LOGIN_COLORS.inputBackground,
                  color: LOGIN_COLORS.inputText,
                  borderColor:
                    errorEmail && emailTouched
                      ? LOGIN_COLORS.error
                      : LOGIN_COLORS.inputBorder,
                },
              ]}
              placeholder="tuemail@ejemplo.com"
              placeholderTextColor={LOGIN_COLORS.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailTouched) setErrorEmail(validateEmail(text));
              }}
              onBlur={() => {
                setEmailTouched(true);
                setErrorEmail(validateEmail(email));
              }}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[styles.inputLabel, { color: LOGIN_COLORS.textPrimary }]}
            >
              Contraseña
            </Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  backgroundColor: LOGIN_COLORS.inputBackground,
                  borderColor:
                    errorPassword && passwordTouched
                      ? LOGIN_COLORS.error
                      : LOGIN_COLORS.inputBorder,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    color: LOGIN_COLORS.inputText,
                  },
                ]}
                placeholder="Tu contraseña"
                placeholderTextColor={LOGIN_COLORS.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordTouched) setErrorPassword(validatePassword(text));
                }}
                onBlur={() => {
                  setPasswordTouched(true);
                  setErrorPassword(validatePassword(password));
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <SimpleLineIcons
                    name="eye"
                    color={LOGIN_COLORS.textSecondary}
                    size={20}
                  />
                ) : (
                  <Feather
                    name="eye-off"
                    color={LOGIN_COLORS.textSecondary}
                    size={20}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: LOGIN_COLORS.buttonBackground },
            ]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text
            style={[styles.registerText, { color: LOGIN_COLORS.textSecondary }]}
          >
            ¿No tienes cuenta?{" "}
          </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text
              style={[
                styles.registerLink,
                { color: LOGIN_COLORS.registerLink },
              ]}
            >
              Registrate gratis
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: LOGIN_COLORS.inputBorder,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: "400",
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    height: 48,
  },
  passwordContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  loginButtonText: {
    color: LOGIN_COLORS.buttonText,
    fontSize: 16,
    fontWeight: "700",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    fontWeight: "400",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  errorText: {
    color: LOGIN_COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  errorBanner: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: LOGIN_COLORS.error,
  },
  errorBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorBannerText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
