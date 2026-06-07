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
import { getIncomeTypes, getNewsTopics, IncomeTypeOption, TopicOption } from "@/services/api/userProfile";
import { registerUser, loginUser } from "@/services/api/auth";
import { runBackgroundRequest } from "@/services/api/backgroundRequest";
import { useRouter } from "expo-router";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { APP_THEME } from "@/constants/themes";
import { FormData, FormErrors } from "@/types/registerForm";
import {
  MIN_AGE,
  buildAgeDate,
  ERROR_PRIORITY,
  validateFormField,
  STEP_TITLES,
  STEP_SUBTITLES,
} from "@/constants/registerValidation";
import ProgressBar   from "@/components/register/ProgressBar";
import ContinueButton from "@/components/register/ContinueButton";
import StepOne       from "@/components/register/StepOne";
import StepTwo       from "@/components/register/StepTwo";
import StepThree     from "@/components/register/StepThree";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ─── Vista principal ────────────────────────────────────────────────────────── */

export default function RegisterScreen() {
  const [incomeTypes, setIncomeTypes] = useState<IncomeTypeOption[]>([]);
  const [categoryMap, setCategoryMap] = useState<TopicOption[]>([]);
  const [step, setStep]               = useState(1);

  const [formData, setFormData] = useState<FormData>({
    nombre:             "",
    apellido:           "",
    email:              "",
    password:           "",
    confirmPassword:    "",
    birthDate:          buildAgeDate(MIN_AGE),
    incomeType:         "",
    incomeAmount:       "",
    spentAmount:        "",
    economicCategories: [],
  });

  const [errors, setErrors]       = useState<FormErrors>({});
  const [emailTaken, setEmailTaken] = useState(false);

  const router = useRouter();
  const { setAccessToken } = useAuth();
  const insets = useSafeAreaInsets();

  const background      = APP_THEME.background.primary;
  const foreground      = APP_THEME.text.primary;
  const border          = APP_THEME.input.border;
  const primary         = APP_THEME.button.primary.background;
  const mutedForeground = APP_THEME.text.secondary;

  /* ─── Carga inicial ── */

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

  /* ─── Utilidades de formulario ── */

  const updateField = (field: keyof FormData, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const validateField = (field: keyof FormData, value: any): boolean => {
    const error = validateFormField(field, value, formData);
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const hasAnyErrors = (): boolean => {
    switch (step) {
      case 1:
        return (
          !validateField("nombre",          formData.nombre)          ||
          !validateField("apellido",        formData.apellido)        ||
          !validateField("email",           formData.email)           ||
          emailTaken                                                  ||
          !validateField("password",        formData.password)        ||
          !validateField("confirmPassword", formData.confirmPassword)
        );
      case 2:
        return (
          !validateField("incomeType",   formData.incomeType)   ||
          !validateField("incomeAmount", formData.incomeAmount) ||
          !validateField("spentAmount",  formData.spentAmount)
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

  /* ─── Navegación entre pasos ── */

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

  /* ─── Registro y login ── */

  const handleRegister = async () => {
    if (hasAnyErrors()) return;

    const income   = parseInt(formData.incomeAmount, 10);
    const expenses = parseInt(formData.spentAmount,  10);
    if (isNaN(income) || isNaN(expenses)) return;

    try {
      await registerUser({
        first_name:       formData.nombre,
        last_name:        formData.apellido,
        email:            formData.email,
        password:         formData.password,
        birth_date:       formData.birthDate.toISOString().split("T")[0],
        income_type:      formData.incomeType,
        monthly_income:   income,
        monthly_expenses: expenses,
        topics:           formData.economicCategories,
      });

      await handleLogin();

      // Disparar generación de tips en background tras el registro
      const token = await AsyncStorage.getItem("token");
      if (token) {
        void runBackgroundRequest("/tips/generate", {
          token,
          baseUrl:          process.env.EXPO_PUBLIC_API_BASE_URL,
          stripApiVersion:  true,
        });
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Register error:", err.message || err);
      alert(err.message || "Unknown error during registration");
    }
  };

  const handleLogin = async () => {
    try {
      const data = await loginUser({
        email:    formData.email,
        password: formData.password,
      });

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
    } catch (err: any) {
      console.error("Login error:", err.message || err);
    }
  };

  /* ─── Renderizado ── */

  const firstError = getFirstError();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: background }]}
    >
      {/* Barra superior */}
      <View style={[styles.topNavbar,{ paddingTop: insets.top+12, },]}>
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
              <Text style={[styles.errorText, { color: APP_THEME.status.error }]}>
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
        bottomInset={insets.bottom}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    justifyContent:  "space-between",
  },
  topNavbar: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               12,
    marginBottom:      16,
    paddingHorizontal: 16,
  },
  backButton: {
    borderRadius:   100,
    width:          40,
    height:         40,
    alignItems:     "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow:      1,
    padding:       16,
    paddingBottom: 80,
  },
  position: {
    fontWeight: "500",
    fontSize:   14,
  },
  title: {
    fontSize:     24,
    fontWeight:   "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize:     14,
    marginBottom: 16,
  },
  formCard: {
    borderRadius:  16,
    paddingVertical: 8,
  },
  errorBanner: {
    padding:       15,
    borderRadius:  8,
    marginBottom:  10,
    flexDirection: "row",
    alignItems:    "center",
    gap:           10,
  },
  errorText: {
    flex:     1,
    fontSize: 16,
  },
});