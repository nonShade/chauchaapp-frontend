import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import{
  getIncomeTypes,
  getNewsTopics,
  IncomeTypeOption,
  TopicOption,
} from "@/services/api/userProfile";
import { useRouter } from "expo-router";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { APP_THEME } from "@/constants/themes";
import { runBackgroundRequest } from "../services/api/backgroundRequest";
 
import { FormData, FormErrors } from "@/types/registerForm";
import ProgressBar from "@/components/register/ProgressBar";
import ContinueButton from "@/components/register/ContinueButton";
import StepOne from "@/components/register/StepOne";
import StepTwo from "@/components/register/StepTwo";
import StepThree from "@/components/register/StepThree";
 
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
 
/* ─── Constantes ─── */
 
const ERROR_PRIORITY: (keyof FormData)[] = [
  "nombre",
  "apellido",
  "email",
  "password",
  "confirmPassword",
  "birthDate",
  "incomeType",
  "incomeAmount",
  "spentAmount",
  "economicCategories",
];
 
const MIN_AGE = 18;
 
const buildAgeDate = (yearsAgo: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d;
};
 
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[\p{L}\s]+$/u;
 
/* ─── Vista principal ─── */
 
export default function RegisterScreen() {
  const [incomeTypes, setIncomeTypes] = useState<IncomeTypeOption[]>([]);
  const [categoryMap, setCategoryMap] = useState<TopicOption[]>([]);
  const [step, setStep] = useState(1);
 
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: buildAgeDate(MIN_AGE),
    incomeType: "",
    incomeAmount: "",
    spentAmount: "",
    economicCategories: [],
  });
 
  const [errors, setErrors] = useState<FormErrors>({});
  // Refleja si el email ya está registrado (verificación async en StepOne)
  const [emailTaken, setEmailTaken] = useState(false);
 
  const router = useRouter();
  const { setAccessToken } = useAuth();
 
  const background = APP_THEME.background.primary;
  const foreground = APP_THEME.text.primary;
  const border = APP_THEME.input.border;
  const primary = APP_THEME.button.primary.background;
  const mutedForeground = APP_THEME.text.secondary;
 
  /* ─── Carga inicial ─── */
 
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [incomeTypesData, categoriesData] = await Promise.all([
          getIncomeTypes(),
          getNewsTopics(),
        ]);
 
        setIncomeTypes(incomeTypesData);
 
        if (incomeTypesData.length > 0) {
          updateField("incomeType", incomeTypesData[0].id);
        }
        setCategoryMap(categoriesData);
      } catch (err) {
        console.error("Error cargando datos iniciales", err);
      }
    };
    loadInitialData();
  }, []);
 
  /* ─── Utilidades de formulario ─── */
 
  const updateField = (field: keyof FormData, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
 
  const validateField = (field: keyof FormData, value: any): boolean => {
    let error = "";
 
    switch (field) {
      case "nombre":
        if (!value.trim()) error = "El nombre es obligatorio";
        else if (!nameRegex.test(value))
          error = "El nombre no puede contener caracteres especiales o numéricos";
        break;
      case "apellido":
        if (!value.trim()) error = "El apellido es obligatorio";
        else if (!nameRegex.test(value))
          error = "El apellido no puede contener caracteres especiales o numéricos";
        break;
      case "email":
        if (!value.trim()) error = "El correo es obligatorio";
        else if (!emailRegex.test(value)) error = "El correo es inválido";
        break;
      case "password":
        if (!value.trim()) error = "La contraseña es obligatoria";
        else if (value.length < 6)
          error = "La contraseña debe tener mínimo 6 caracteres";
        break;
      case "confirmPassword":
        if (!value.trim()) error = "Se debe confirmar la contraseña";
        else if (value !== formData.password)
          error = "Las contraseñas deben coincidir";
        break;
      case "incomeType":
        if (!value) error = "Selecciona un tipo de ingreso";
        break;
      case "incomeAmount": {
        const num = Number(value);
        if (!value.trim()) error = "El ingreso es obligatorio";
        else if (isNaN(num)) error = "Debe ser un número válido";
        else if (num <= 0) error = "El ingreso debe ser mayor a 0";
        else if (num <= 5000) error = "El ingreso no puede ser tan bajo";
        break;
      }
      case "spentAmount": {
        const num = Number(value);
        if (!value.trim()) error = "Los gastos son obligatorios";
        else if (isNaN(num)) error = "Debe ser un número válido";
        else if (num < 0) error = "Los gastos no pueden ser negativos";
        break;
      }
      case "economicCategories":
        if (value.length === 0) error = "Selecciona al menos una categoría";
        break;
    }
 
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };
 
  const hasAnyErrors = (): boolean => {
    switch (step) {
      case 1:
        return (
          !validateField("nombre", formData.nombre) ||
          !validateField("apellido", formData.apellido) ||
          !validateField("email", formData.email) ||
          emailTaken ||                                     // email ya registrado
          !validateField("password", formData.password) ||
          !validateField("confirmPassword", formData.confirmPassword)
        );
      case 2:
        return (
          !validateField("incomeType", formData.incomeType) ||
          !validateField("incomeAmount", formData.incomeAmount) ||
          !validateField("spentAmount", formData.spentAmount)
        );
      case 3:
        return !validateField("economicCategories", formData.economicCategories);
      default:
        return false;
    }
  };
 
  const getFirstError = (): string => {
    for (const field of ERROR_PRIORITY) {
      if (errors[field]) return errors[field]!;
    }
    return "";
  };
 
  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => {
      const exists = prev.economicCategories.includes(categoryId);
      return {
        ...prev,
        economicCategories: exists
          ? prev.economicCategories.filter((c) => c !== categoryId)
          : [...prev.economicCategories, categoryId],
      };
    });
  };
 
  /* ─── Navegación entre pasos ─── */
 
  const handleNext = () => {
    if (!hasAnyErrors()) {
      setErrors({});
      setStep((s) => s + 1);
    }
  };
 
  const handleBack = () => {
    if (step === 1) return router.back();
    setErrors({});
    setStep((s) => s - 1);
  };
 
  /* ─── Registro y login ─── */
 
  const handleRegister = async () => {
    if (hasAnyErrors()) return;
 
    const income = parseInt(formData.incomeAmount, 10);
    const expenses = parseInt(formData.spentAmount, 10);
    if (isNaN(income) || isNaN(expenses)) return;
 
    try {
      const payload = {
        first_name: formData.nombre,
        last_name: formData.apellido,
        email: formData.email,
        password: formData.password,
        birth_date: formData.birthDate.toISOString().split("T")[0],
        income_type: formData.incomeType,
        monthly_income: income,
        monthly_expenses: expenses,
        topics: formData.economicCategories,
      };
 
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        let message = "Error en registro";
        if (Array.isArray(data.detail)) {
          message = data.detail
            .map((err: any) => `${err.loc?.join(".")}: ${err.msg}`)
            .join("\n");
        } else if (typeof data.detail === "string") {
          message = data.detail;
        } else {
          message = JSON.stringify(data, null, 2);
        }
        throw new Error(message);
      }
 
      await handleLogin();
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Register error:", err.message || err);
      alert(err.message || "Unknown error during registration");
    }
  };
 
  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        let message = "Error al iniciar sesión";
        if (Array.isArray(data.detail)) {
          message = data.detail
            .map((err: any) => `${err.loc?.join(".")}: ${err.msg}`)
            .join("\n");
        } else if (typeof data.detail === "string") {
          message = data.detail;
        }
        throw new Error(message);
      }
 
      if (data.access_token) {
        await AsyncStorage.setItem("token", data.access_token);
        setAccessToken(data.access_token);
      }
      if (data.refresh_token) {
        await AsyncStorage.setItem("refresh_token", data.refresh_token);
      }
      if (data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }

      if (data.access_token) {
        void runBackgroundRequest("/tips/generate", {
          token: data.access_token,
          baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
        });
      }
 
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Login error:", err.message || err);
    }
  };
 
  /* ─── Renderizado ─── */
 
  const firstError = getFirstError();
 
  const STEP_TITLES: Record<number, string> = {
    1: "Crea tu cuenta",
    2: "Tu situación financiera",
    3: "¿Qué noticias te interesan?",
  };
 
  const STEP_SUBTITLES: Record<number, string> = {
    1: "Datos básicos para acceder a la app.",
    2: "La IA usa esto para personalizar tus reportes.",
    3: "Recibirás noticias relevantes según tus intereses.",
  };
 
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: background }]}
    >
      {/* Barra superior */}
      <View style={styles.topNavbar}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: border }]}
        >
          <FontAwesome name="angle-left" color={foreground} size={32} />
        </TouchableOpacity>
 
        <ProgressBar step={step} />
      </View>
 
      {/* Contenido scrolleable */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View>
          <Text style={[styles.position, { color: primary }]}>
            Paso {step} de 3
          </Text>
          <Text style={[styles.title, { color: foreground }]}>
            {STEP_TITLES[step]}
          </Text>
          <Text style={[styles.subtitle, { color: mutedForeground }]}>
            {STEP_SUBTITLES[step]}
          </Text>
        </View>
 
        <View style={[styles.formCard, { backgroundColor: background }]}>
          {/* Banner de error */}
          {firstError !== "" && (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: APP_THEME.status.error + "15" },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color={APP_THEME.status.error}
              />
              <Text
                style={[
                  styles.errorText,
                  { color: APP_THEME.status.error },
                ]}
              >
                {firstError}
              </Text>
            </View>
          )}
 
          {/* Pasos */}
          {step === 1 && (
            <StepOne
              formData={formData}
              errors={errors}
              updateField={updateField}
              validateField={validateField}
              onSubmit={handleNext}
              onEmailTakenChange={setEmailTaken}
            />
          )}
          {step === 2 && (
            <StepTwo
              formData={formData}
              errors={errors}
              incomeTypes={incomeTypes}
              updateField={updateField}
              validateField={validateField}
            />
          )}
          {step === 3 && (
            <StepThree
              formData={formData}
              categoryMap={categoryMap}
              toggleCategory={toggleCategory}
            />
          )}
        </View>
      </ScrollView>
 
      {/* Barra inferior */}
      <ContinueButton
        step={step}
        onNext={handleNext}
        onRegister={handleRegister}
      />
    </KeyboardAvoidingView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    justifyContent: "space-between",
  },
  topNavbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    borderRadius: 100,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 80,
  },
  position: {
    fontWeight: "500",
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  formCard: {
    borderRadius: 16,
    paddingVertical: 8,
  },
  errorBanner: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 16,
  },
});