import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { APP_THEME } from "@/constants/themes";
import { FormData, FormErrors } from "@/types/registerForm";
 
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
 
/* ── Estados posibles para la verificación de email ── */
type EmailCheckStatus = "idle" | "checking" | "available" | "taken" | "error";
 
type Props = {
  formData: FormData;
  errors: FormErrors;
  updateField: (field: keyof FormData, value: any) => void;
  validateField: (field: keyof FormData, value: any) => boolean;
  onSubmit: () => void;
  /** Notifica al padre si el email ya existe en el sistema */
  onEmailTakenChange: (taken: boolean) => void;
};
 
export default function StepOne({
  formData,
  errors,
  updateField,
  validateField,
  onSubmit,
  onEmailTakenChange,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailCheckStatus>("idle");
 
  const apellidoRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
 
  const background = APP_THEME.background.primary;
  const foreground = APP_THEME.text.primary;
  const border = APP_THEME.input.border;
  const mutedForeground = APP_THEME.text.secondary;
  const errorColor = APP_THEME.status.error;
  const successColor = APP_THEME.status?.success ?? "#22c55e";
  const warningColor = "#f59e0b";
 
  /* ── Estilos base reutilizables ── */
  const inputBaseStyle = [
    styles.input,
    { backgroundColor: background, color: foreground, borderColor: border },
  ];
  const inputErrorStyle = {
    borderColor: errorColor,
    backgroundColor: errorColor + "15",
  };
  const passwordContainerStyle = [
    styles.passwordContainer,
    { backgroundColor: background, borderColor: border },
  ];
 
  /* ── Borde dinámico del campo email según su estado ── */
  const emailBorderColor = () => {
    if (errors.email) return errorColor;
    if (emailStatus === "available") return successColor;
    if (emailStatus === "taken") return errorColor;
    if (emailStatus === "error") return warningColor;
    return border;
  };
 
  const emailBgColor = () => {
    if (errors.email || emailStatus === "taken") return errorColor + "15";
    if (emailStatus === "available") return successColor + "12";
    if (emailStatus === "error") return warningColor + "15";
    return background;
  };
 
  /* ── Ícono de estado a la derecha del email ── */
  const renderEmailStatusIcon = () => {
    switch (emailStatus) {
      case "checking":
        return (
          <ActivityIndicator
            size="small"
            color={mutedForeground}
            style={styles.emailStatusIcon}
          />
        );
      case "available":
        return (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={successColor}
            style={styles.emailStatusIcon}
          />
        );
      case "taken":
        return (
          <Ionicons
            name="close-circle"
            size={20}
            color={errorColor}
            style={styles.emailStatusIcon}
          />
        );
      case "error":
        return (
          <Ionicons
            name="alert-circle"
            size={20}
            color={warningColor}
            style={styles.emailStatusIcon}
          />
        );
      default:
        return null;
    }
  };
 
  /* ── Texto de ayuda bajo el campo email ── */
  const renderEmailHint = () => {
    if (emailStatus === "available") {
      return (
        <Text style={[styles.hintText, { color: successColor }]}>
          Correo disponible
        </Text>
      );
    }
    if (emailStatus === "taken") {
      return (
        <Text style={[styles.hintText, { color: errorColor }]}>
          Este correo ya está registrado
        </Text>
      );
    }
    if (emailStatus === "error") {
      return (
        <Text style={[styles.hintText, { color: warningColor }]}>
          No se pudo verificar el correo. Continúa de todas formas.
        </Text>
      );
    }
    return null;
  };
 
  /* ── Verificación asíncrona contra el backend ── */
  const checkEmailExists = async (email: string) => {
    // Primero validamos el formato localmente; si falla no llamamos al backend
    const isFormatValid = validateField("email", email);
    if (!isFormatValid) {
      setEmailStatus("idle");
      return;
    }
 
    setEmailStatus("checking");
 
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
 
      if (!res.ok) {
        // Error de validación 422 u otro error HTTP → no bloqueamos al usuario
        setEmailStatus("error");
        onEmailTakenChange(false);
        return;
      }
 
      const data: { exists: boolean; message: string } = await res.json();
 
      if (data.exists) {
        setEmailStatus("taken");
        onEmailTakenChange(true);
      } else {
        setEmailStatus("available");
        onEmailTakenChange(false);
        // Re-validamos el formato para limpiar cualquier error previo
        validateField("email", email);
      }
    } catch {
      // Error de red → avisamos pero no bloqueamos el registro
      setEmailStatus("error");
      onEmailTakenChange(false);
    }
  };
 
  /* ── Cuando el usuario abandona el campo email ── */
  const handleEmailBlur = () => {
    checkEmailExists(formData.email);
  };
 
  /* ── Cuando el usuario vuelve a editar el email, reseteamos el estado ── */
  const handleEmailChange = (text: string) => {
    updateField("email", text);
    if (emailStatus !== "idle") {
      setEmailStatus("idle");
      onEmailTakenChange(false);
    }
  };
 
  return (
    <View style={styles.mainContainer}>
      {/* ── Nombre y Apellido ── */}
      <View style={styles.fullnameContainer}>
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: foreground }]}>Nombre</Text>
          <TextInput
            style={[inputBaseStyle, errors.nombre && inputErrorStyle]}
            placeholder="Tu nombre"
            placeholderTextColor={mutedForeground}
            value={formData.nombre}
            onChangeText={(text) => updateField("nombre", text)}
            onBlur={() => validateField("nombre", formData.nombre)}
            onSubmitEditing={() => apellidoRef.current?.focus()}
            returnKeyType="next"
          />
        </View>
 
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: foreground }]}>
            Apellido
          </Text>
          <TextInput
            ref={apellidoRef}
            style={[inputBaseStyle, errors.apellido && inputErrorStyle]}
            placeholder="Tu apellido"
            placeholderTextColor={mutedForeground}
            value={formData.apellido}
            onChangeText={(text) => updateField("apellido", text)}
            onBlur={() => validateField("apellido", formData.apellido)}
            onSubmitEditing={() => emailRef.current?.focus()}
            returnKeyType="next"
          />
        </View>
      </View>
 
      {/* ── Email con verificación asíncrona ── */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.inputLabel, { color: foreground }]}>
          Correo electrónico
        </Text>
 
        {/* Contenedor que imita el estilo del input pero con ícono a la derecha */}
        <View
          style={[
            styles.emailContainer,
            {
              borderColor: emailBorderColor(),
              backgroundColor: emailBgColor(),
            },
          ]}
        >
          <TextInput
            ref={emailRef}
            style={[styles.emailInput, { color: foreground }]}
            placeholder="tuemail@ejemplo.com"
            placeholderTextColor={mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={formData.email}
            onChangeText={handleEmailChange}
            onBlur={handleEmailBlur}
            onSubmitEditing={() => {
              // Si ya verificamos y está disponible, avanzamos al siguiente campo
              if (emailStatus !== "checking") {
                passwordRef.current?.focus();
              }
            }}
            returnKeyType="next"
          />
          {renderEmailStatusIcon()}
        </View>
 
        {renderEmailHint()}
      </View>
 
      {/* ── Contraseña ── */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.inputLabel, { color: foreground }]}>
          Contraseña
        </Text>
        <View
          style={[passwordContainerStyle, errors.password && inputErrorStyle]}
        >
          <TextInput
            ref={passwordRef}
            style={[styles.passwordInput, { color: foreground }]}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={mutedForeground}
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => updateField("password", text)}
            onBlur={() => {
              validateField("password", formData.password);
              validateField("confirmPassword", formData.confirmPassword);
            }}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            returnKeyType="next"
          />
          <TouchableOpacity
            onPress={() => formData.password && setShowPassword((v) => !v)}
          >
            <Entypo
              name={showPassword ? "eye" : "eye-with-line"}
              size={24}
              color={mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>
 
      {/* ── Confirmar contraseña ── */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.inputLabel, { color: foreground }]}>
          Confirmar contraseña
        </Text>
        <View
          style={[
            passwordContainerStyle,
            errors.confirmPassword && inputErrorStyle,
          ]}
        >
          <TextInput
            ref={confirmPasswordRef}
            style={[styles.passwordInput, { color: foreground }]}
            placeholder="Repite tu contraseña"
            placeholderTextColor={mutedForeground}
            secureTextEntry={!showConfirmPassword}
            value={formData.confirmPassword}
            onChangeText={(text) => updateField("confirmPassword", text)}
            onBlur={() =>
              validateField("confirmPassword", formData.confirmPassword)
            }
            onSubmitEditing={onSubmit}
          />
          <TouchableOpacity
            onPress={() =>
              formData.confirmPassword && setShowConfirmPassword((v) => !v)
            }
          >
            <Entypo
              name={showConfirmPassword ? "eye" : "eye-with-line"}
              size={24}
              color={mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  mainContainer: {
    gap: 12,
  },
  fullnameContainer: {
    flexDirection: "row",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    gap: 4,
  },
  fieldContainer: {
    gap: 4,
  },
  inputLabel: {
    marginBottom: 4,
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    justifyContent: "center",
  },
  /* Contenedor del email: igual al input pero con slot para ícono */
  emailContainer: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emailInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontSize: 16,
  },
  emailStatusIcon: {
    marginLeft: 8,
  },
  hintText: {
    fontSize: 12,
    marginTop: 2,
  },
  passwordContainer: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontSize: 16,
  },
});