import { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Animated } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { APP_THEME } from "@/constants/themes";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const fetchIncomeTypes = async () => {
  const res = await fetch(`${API_BASE_URL}/transactions/income-types`);

  if (!res.ok) {
    throw new Error("Error al obtener tipos de ingreso");
  }

  return res.json();
};

const fetchNewsTopics = async () => {
  const res = await fetch(`${API_BASE_URL}/news/topics`);

  if (!res.ok) {
    throw new Error("Error al obtener categorias económicas");
  }

  return res.json();
};

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: Date;
  incomeType: string;
  incomeAmount: string;
  spentAmount: string;
  economicCategories: string[];
};

type FormErrors = Partial<Record<keyof FormData, string>>;

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
const MAX_AGE = 50;

const buildAgeDate = (yearsAgo: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[\p{L}\s]+$/u;

export default function RegisterScreen() {
  const [incomeTypes, setIncomeTypes] = useState<any[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, any>>({});

  const router = useRouter();

  const theme = {
    background: APP_THEME.background.primary,
    foreground: APP_THEME.text.primary,
    border: APP_THEME.input.border,
    primary: APP_THEME.button.primary.background,
    mutedForeground: APP_THEME.text.secondary,
  };

  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* Refs para saltos dentro del formulario */
  const apellidoRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const incomeAmountRef = useRef<TextInput>(null);
  const spentAmountRef = useRef<TextInput>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const stepScale = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      progress.setValue(step);
      return;
    }

    Animated.timing(progress, {
      toValue: step,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [step]);

  useEffect(() => {
    stepScale.setValue(0.9);
    Animated.spring(stepScale, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const progressWidth = progress.interpolate({
    inputRange: [1, 2, 3],
    outputRange: ["5%", "50%", "100%"],
  });

  const minDate = buildAgeDate(MIN_AGE);
  const maxDate = buildAgeDate(MAX_AGE);

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: minDate,
    incomeType: "",
    incomeAmount: "",
    spentAmount: "",
    economicCategories: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  /* ─── Utilidades de formulario ─── */

  const updateField = (field: keyof FormData, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [incomeTypesData, categoriesData] = await Promise.all([
          fetchIncomeTypes(),
          fetchNewsTopics(),
        ]);

        setIncomeTypes(incomeTypesData);

        if (incomeTypesData.length > 0) {
          updateField("incomeType", incomeTypesData[0].id);
        }

        const map: Record<string, any> = {};
        categoriesData.forEach((cat: any) => {
          map[cat.name] = cat;
        });

        setCategoryMap(map);
      } catch (err) {
        console.error("Error cargando datos iniciales", err);
      }
    };
    loadInitialData();
  }, []);

  const getFirstError = () => {
    for (const field of ERROR_PRIORITY) {
      if (errors[field]) return errors[field];
    }
    return "";
  };

  const validateField = (field: keyof FormData, value: any): boolean => {
    let error = "";

    switch (field) {
      case "nombre":
        if (!value.trim()) error = "El nombre es obligatorio";
        else if (!nameRegex.test(value))
          error =
            "El nombre no puede contener caracteres especiales o numéricos";
        break;
      case "apellido":
        if (!value.trim()) error = "El apellido es obligatorio";
        else if (!nameRegex.test(value))
          error =
            "El apellido no puede contener caracteres especiales o numéricos";
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
      case "incomeAmount":
        const incomeNum = Number(value);
        if (!value.trim()) error = "El ingreso es obligatorio";
        else if (isNaN(incomeNum)) error = "Debe ser un número válido";
        else if (incomeNum <= 0) error = "El ingreso debe ser mayor a 0";
        else if (incomeNum <= 5000) error = "El ingreso no puede ser tan bajo";
        break;
      case "spentAmount":
        const spentNum = Number(value);
        if (!value.trim()) error = "Los gastos son obligatorios";
        else if (isNaN(spentNum)) error = "Debe ser un número válido";
        else if (spentNum < 0) error = "Los gastos no pueden ser negativos";
        break;
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
        const nombreError = !validateField("nombre", formData.nombre);
        const apellidoError = !validateField("apellido", formData.apellido);
        const emailError = !validateField("email", formData.email);
        const passwordError = !validateField("password", formData.password);
        const confirmPasswordError = !validateField(
          "confirmPassword",
          formData.confirmPassword,
        );
        return (
          nombreError ||
          apellidoError ||
          emailError ||
          passwordError ||
          confirmPasswordError
        );
      case 2:
        const incomeTypeError = !validateField(
          "incomeType",
          formData.incomeType,
        );
        const incomeAmountError = !validateField(
          "incomeAmount",
          formData.incomeAmount,
        );
        const spentAmountError = !validateField(
          "spentAmount",
          formData.spentAmount,
        );
        return incomeTypeError || incomeAmountError || spentAmountError;
      case 3:
        const economicCategoriesError = !validateField(
          "economicCategories",
          formData.economicCategories,
        );
        return economicCategoriesError;
      default:
        return false;
    }
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

      console.log("Payload send:", JSON.stringify(payload, null, 2));

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error, response:", data);

        let message = "Error en registro";

        if (Array.isArray(data.detail)) {
          message = data.detail
            .map((err: any) => `${err.loc?.join(".")}: ${err.msg}`)
            .join("\n");
        } else if (typeof data.detail === "string") {
          message = data.detail;
        } else if (typeof data === "object") {
          message = JSON.stringify(data, null, 2);
        }
        throw new Error(message);
      }

      console.log("Successful registration:", data);

      handleLogin();

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Register error:", err.message || err);

      alert(err.message || "Unknown error during registration");
    }
  };

  const [loginError, setLoginError] = useState<string>("");

  const handleLogin = async () => {
    const payload = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
        } else if (typeof data === "object") {
          message = JSON.stringify(data, null, 2);
        }
        throw new Error(message);
      }
      // TODO: almacenar data.access_token y data.refresh_token
      console.log("Successful login:", data);
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Login error:", err.message || err);
      setLoginError(err.message || "No se pudo conectar con el servidor");
    }
  };

  /* ─── Estilos dinámicos derivados del tema ─── */

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.background,
      color: theme.foreground,
      borderColor: theme.border,
    },
  ];
  const inputErrorStyle = {
    borderColor: APP_THEME.status.error,
    backgroundColor: APP_THEME.status.error + "15",
  };
  const passwordContainerStyle = [
    styles.passwordContainer,
    { backgroundColor: theme.background, borderColor: theme.border },
  ];
  const gridOptionStyle = [styles.gridOption, { borderColor: theme.border }];
  const gridActiveStyle = {
    backgroundColor: `${theme.primary}20`,
    borderColor: theme.primary,
    borderWidth: 2,
  };

  /* ─── Renderizado de pasos ─── */
  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === "set" && selectedDate) {
      updateField("birthDate", selectedDate);
    }
    setShowDatePicker(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={[styles.mainContainer]}>
            <View style={styles.fullnameContainer}>
              <View style={styles.inputContainer}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: theme.foreground },
                    styles.normalText,
                  ]}
                >
                  Nombre
                </Text>
                <TextInput
                  style={[
                    inputStyle,
                    errors.nombre && inputErrorStyle,
                    styles.normalText,
                  ]}
                  placeholder="Tu nombre"
                  placeholderTextColor={theme.mutedForeground}
                  value={formData.nombre}
                  onChangeText={(text) => updateField("nombre", text)}
                  onBlur={() => validateField("nombre", formData.nombre)}
                  onSubmitEditing={() => apellidoRef.current?.focus()}
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: theme.foreground },
                    styles.normalText,
                  ]}
                >
                  Apellido
                </Text>
                <TextInput
                  ref={apellidoRef}
                  style={[
                    inputStyle,
                    errors.apellido && inputErrorStyle,
                    styles.normalText,
                  ]}
                  placeholder="Tu apellido"
                  placeholderTextColor={theme.mutedForeground}
                  value={formData.apellido}
                  onChangeText={(text) => updateField("apellido", text)}
                  onBlur={() => validateField("apellido", formData.apellido)}
                  onSubmitEditing={() => emailRef.current?.focus()}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.foreground },
                  styles.normalText,
                ]}
              >
                Correo electrónico
              </Text>
              <TextInput
                ref={emailRef}
                style={[
                  inputStyle,
                  errors.email && inputErrorStyle,
                  styles.normalText,
                ]}
                placeholder="tuemail@ejemplo.com"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => updateField("email", text)}
                onBlur={() => validateField("email", formData.email)}
                onSubmitEditing={() => passwordRef.current?.focus()}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.foreground },
                  styles.normalText,
                ]}
              >
                Contraseña
              </Text>
              <View
                style={[
                  passwordContainerStyle,
                  errors.password && inputErrorStyle,
                ]}
              >
                <TextInput
                  ref={passwordRef}
                  style={[
                    styles.passwordInput,
                    { color: theme.foreground },
                    styles.normalText,
                  ]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={theme.mutedForeground}
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
                  onPress={() =>
                    formData.password && setShowPassword((v) => !v)
                  }
                >
                  <Entypo
                    name={showPassword ? "eye" : "eye-with-line"}
                    size={24}
                    color={theme.mutedForeground}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.foreground },
                  styles.normalText,
                ]}
              >
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
                  style={[
                    styles.passwordInput,
                    { color: theme.foreground },
                    styles.normalText,
                  ]}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={theme.mutedForeground}
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField("confirmPassword", text)}
                  onBlur={() =>
                    validateField("confirmPassword", formData.confirmPassword)
                  }
                  onSubmitEditing={handleNext}
                />
                <TouchableOpacity
                  onPress={() =>
                    formData.confirmPassword &&
                    setShowConfirmPassword((v) => !v)
                  }
                >
                  <Entypo
                    name={showConfirmPassword ? "eye" : "eye-with-line"}
                    size={24}
                    color={theme.mutedForeground}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={[styles.mainContainer]}>
            <View>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.foreground },
                  styles.normalText,
                ]}
              >
                Fecha de nacimiento
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      justifyContent: "center",
                    },
                    errors.birthDate && inputErrorStyle,
                  ]}
                >
                  <Text
                    style={[{ color: theme.foreground }, styles.normalText]}
                  >
                    {formData.birthDate.toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={formData.birthDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={minDate}
                minimumDate={maxDate}
                onChange={handleDateChange}
              />
            )}
            <View>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.foreground },
                  styles.normalText,
                ]}
              >
                Tipo de ingreso
              </Text>
              <View style={[styles.grid]}>
                {incomeTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      gridOptionStyle,
                      formData.incomeType === type.id && gridActiveStyle,
                      { borderRadius: 20 },
                    ]}
                    onPress={() => {
                      updateField("incomeType", type.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: theme.foreground },
                        styles.normalText,
                        formData.incomeType === type.id && {
                          color: theme.primary,
                        },
                      ]}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.foreground },
                  styles.normalText,
                ]}
              >
                Ingreso mensual (CLP)
              </Text>
              <TextInput
                ref={incomeAmountRef}
                style={[
                  inputStyle,
                  errors.incomeAmount && inputErrorStyle,
                  styles.normalText,
                ]}
                placeholder="Ej: 800000"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="numeric"
                value={formData.incomeAmount}
                onChangeText={(text) =>
                  updateField("incomeAmount", text.replace(/[^0-9]/g, ""))
                }
                onBlur={() =>
                  validateField("incomeAmount", formData.incomeAmount)
                }
                onSubmitEditing={() => spentAmountRef.current?.focus()}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.foreground },
                  styles.normalText,
                ]}
              >
                Gastos mensuales estimados (CLP)
              </Text>
              <TextInput
                ref={spentAmountRef}
                style={[
                  inputStyle,
                  errors.spentAmount && inputErrorStyle,
                  styles.normalText,
                ]}
                placeholder="Ej: 500000"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="numeric"
                value={formData.spentAmount}
                onChangeText={(text) =>
                  updateField("spentAmount", text.replace(/[^0-9]/g, ""))
                }
                onBlur={() =>
                  validateField("spentAmount", formData.spentAmount)
                }
                returnKeyType="done"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={[{ color: theme.mutedForeground }, styles.normalText]}>
              Selecciona todos los que aplican. Mínimo 1.
            </Text>
            <View style={styles.grid}>
              {Object.values(categoryMap).map((category: any) => {
                const isActive = formData.economicCategories.includes(
                  category.id,
                );

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      gridOptionStyle,
                      isActive && gridActiveStyle,
                      {
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                      },
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text
                      style={[
                        styles.gridText,
                        { color: theme.foreground, textAlign: "left" },
                        styles.normalText,
                        isActive && { color: theme.primary },
                      ]}
                    >
                      {category.name}
                    </Text>
                    <Text
                      style={[
                        styles.gridSubText,
                        {
                          color: theme.mutedForeground,
                          fontSize: 18,
                          textAlign: "left",
                        },
                      ]}
                    >
                      {category.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const firstError = getFirstError();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Barra superior */}
      <View style={styles.topNavbar}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: theme.border }]}
        >
          <FontAwesome name="angle-left" color={theme.foreground} size={32} />
        </TouchableOpacity>

        <View style={styles.progressBar}>
          <View style={styles.stepsContainer}>
            {/* Paso 1 */}
            <Animated.View
              style={[
                styles.progressStep,
                {
                  borderColor:
                    step >= 1 ? theme.primary : theme.mutedForeground,
                  backgroundColor: step > 1 ? theme.primary : "transparent",
                  transform: [{ scale: stepScale }],
                },
              ]}
            >
              {step > 1 ? (
                <Ionicons
                  name="checkmark"
                  size={32}
                  color={APP_THEME.text.primary}
                />
              ) : (
                <Feather name="user" size={24} color={theme.primary} />
              )}
            </Animated.View>
            {/* Paso 2 */}
            <Animated.View
              style={[
                styles.progressStep,
                {
                  borderColor:
                    step >= 2 ? theme.primary : theme.mutedForeground,
                  backgroundColor: step > 2 ? theme.primary : "transparent",
                  transform: [{ scale: step === 2 ? stepScale : 1 }],
                },
              ]}
            >
              {step > 2 ? (
                <Ionicons
                  name="checkmark"
                  size={32}
                  color={APP_THEME.text.primary}
                />
              ) : (
                <Feather
                  name="dollar-sign"
                  size={24}
                  color={step >= 2 ? theme.primary : theme.mutedForeground}
                />
              )}
            </Animated.View>
            {/* Paso 3 */}
            <Animated.View
              style={[
                styles.progressStep,
                {
                  borderColor:
                    step >= 3 ? theme.primary : theme.mutedForeground,
                  transform: [{ scale: step === 3 ? stepScale : 1 }],
                },
              ]}
            >
              <Ionicons
                name="newspaper-outline"
                size={24}
                color={step >= 3 ? theme.primary : theme.mutedForeground}
              />
            </Animated.View>
          </View>

          {/* Barra de progreso */}
          <View
            style={[styles.progressTrack, { backgroundColor: theme.border }]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: theme.primary, width: progressWidth },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Contenido scrolleable */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View>
          <Text style={[styles.position, { color: theme.primary }]}>
            Paso {step} de 3
          </Text>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {step === 1 && "Crea tu cuenta"}
            {step === 2 && "Tu situación financiera"}
            {step === 3 && "¿Qué noticias te interesan?"}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.mutedForeground },
              styles.normalText,
            ]}
          >
            {step === 1 && "Datos básicos para acceder a la app."}
            {step === 2 && "La IA usa esto para personalizar tus reportes."}
            {step === 3 && "Recibirás noticias relevantes según tus intereses."}
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.background }]}>
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
                  styles.normalText,
                ]}
              >
                {firstError}
              </Text>
            </View>
          )}
          {renderStep()}
        </View>
      </ScrollView>

      {/* Barra inferior */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
            gap: 15,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.primary }]}
          onPress={step < 3 ? handleNext : handleRegister}
        >
          <Text
            style={[
              styles.navButtonText,
              { color: theme.background },
              styles.normalText,
            ]}
          >
            {step < 3 ? "Siguiente" : "Crear cuenta"}
          </Text>
        </TouchableOpacity>
        {step === 1 && (
          <Text
            style={[
              {
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                color: theme.foreground,
              },
              styles.normalText,
            ]}
          >
            ¿Ya tienes cuenta?{" "}
            <Text
              style={{ color: theme.primary }}
              onPress={() => router.replace("/login")}
            >
              Inicia sesión
            </Text>
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    justifyContent: "space-between",
  },

  normalText: {
    fontSize: 16,
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

  progressBar: {
    flex: 1,
    gap: 8,
    alignItems: "center",
  },

  stepsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },

  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },

  progressTrack: {
    height: 6,
    width: "90%",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 4,
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
  },

  mainContainer: {
    gap: 12,
  },

  fieldContainer: {
    gap: 4,
  },

  fullnameContainer: {
    flexDirection: "row",
    gap: 12,
  },

  inputContainer: {
    flex: 1,
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
    justifyContent: "center",
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
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },

  gridOption: {
    width: "48%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  gridText: {
    fontWeight: "600",
    textAlign: "center",
  },

  gridSubText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  footer: {
    borderTopWidth: 1,
    padding: 12,
    paddingBottom: 12,
    gap: 12,
  },

  navButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  navButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
