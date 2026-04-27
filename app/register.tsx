import { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import React from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const fetchIncomeTypes = async () => {
  const res = await fetch(`${API_BASE_URL}/transactions/income-types`);

  if (!res.ok) {
    throw new Error("Error al obtener tipos de ingreso");
  }

  return res.json();
};

const fetchNewsTopics= async () => {
  const res = await fetch(`${API_BASE_URL}/news/topics`);

  if (!res.ok) {
    throw new Error("Error al obtener categorias económicas");
  }

  return res.json();
}

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
  'nombre', 'apellido', 'email', 'password', 'confirmPassword',
  'birthDate', 'incomeType', 'incomeAmount', 'spentAmount', 'economicCategories',
];

const MIN_AGE = 18;
const MAX_AGE = 100;

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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [incomeTypesData, categoriesData] = await Promise.all([
          fetchIncomeTypes(),
          fetchNewsTopics(),
        ]);

        setIncomeTypes(incomeTypesData);

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

  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

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

  const minDate = buildAgeDate(MIN_AGE);
  const maxDate = buildAgeDate(MAX_AGE);

  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: minDate,
    incomeType: '',
    incomeAmount: '',
    spentAmount: '',
    economicCategories: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  /* ─── Utilidades de formulario ─── */

  const updateField = (field: keyof FormData, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const getFirstError = () => {
    for (const field of ERROR_PRIORITY) {
      if (errors[field]) return errors[field];
    }
    return '';
  };

  const validateField = (field: keyof FormData, value: any): boolean => {
    let error = '';

    switch (field) {
      case 'nombre':
        if (!value.trim()) error = 'El nombre es obligatorio';
        else if (!nameRegex.test(value)) error = 'El nombre no puede contener caracteres especiales o numéricos';
        break;
      case 'apellido':
        if (!value.trim()) error = 'El apellido es obligatorio';
        else if (!nameRegex.test(value)) error = 'El apellido no puede contener caracteres especiales o numéricos';
        break;
      case 'email':
        if (!value.trim()) error = 'El correo es obligatorio';
        else if (!emailRegex.test(value)) error = 'El correo es inválido';
        break;
      case 'password':
        if (!value.trim()) error = 'La contraseña es obligatoria';
        else if (value.length < 6) error = 'La contraseña debe tener mínimo 6 caracteres';
        break;
      case 'confirmPassword':
        if (!value.trim()) error = 'Se debe confirmar la contraseña';
        else if (value !== formData.password) error = 'Las contraseñas deben coincidir';
        break;
      case 'incomeAmount':
        const incomeNum = Number(value);
        if (!value.trim()) error = 'El ingreso es obligatorio';
        else if (isNaN(incomeNum)) error = 'Debe ser un número válido';
        else if (incomeNum <= 0) error = 'El ingreso debe ser mayor a 0';
        else if (incomeNum <= 5000) error = 'El ingreso no puede ser tan bajo';
        break;
      case 'spentAmount':
        const spentNum = Number(value);
        if (!value.trim()) error = 'Los gastos son obligatorios';
        else if (isNaN(spentNum)) error = 'Debe ser un número válido';
        else if (spentNum < 0) error = 'Los gastos no pueden ser negativos';
        break;
      case 'economicCategories':
        if (value.length === 0) error = 'Selecciona al menos una categoría';
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === '';
  };

  const hasAnyErrors = (): boolean => {
    switch (step) {
      case 1:
        const nombreError = !validateField('nombre', formData.nombre);
        const apellidoError = !validateField('apellido', formData.apellido);
        const emailError = !validateField('email', formData.email);
        const passwordError = !validateField('password', formData.password);
        const confirmPasswordError = !validateField('confirmPassword', formData.confirmPassword);
        return nombreError || apellidoError || emailError || passwordError || confirmPasswordError;
      case 2:
        const incomeAmountError = !validateField('incomeAmount', formData.incomeAmount);
        const spentAmountError = !validateField('spentAmount', formData.spentAmount);
        return incomeAmountError || spentAmountError;
      case 3:
        const economicCategoriesError = !validateField('economicCategories', formData.economicCategories);
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
    if (!hasAnyErrors()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 1) return router.back();
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

      router.replace('/(tabs)');

    } catch (err: any) {
      console.error("Register error:", err.message || err);

      alert(err.message || "Unknown error during registration");
    }
  };

  const [loginError, setLoginError] = useState<string>('');

  const handleLogin = async () => {
    const payload = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        let message = 'Error al iniciar sesión';
        if (Array.isArray(data.detail)) {
          message = data.detail
            .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
            .join('\n');
        } else if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (typeof data === 'object') {
          message = JSON.stringify(data, null, 2);
        }
        throw new Error(message);
      }
    // TODO: almacenar data.access_token y data.refresh_token
      console.log('Successful login:', data);
      router.replace('/(tabs)');

    } catch (err: any) {
      console.error('Login error:', err.message || err);
      setLoginError(err.message || 'No se pudo conectar con el servidor');
    }
};

  /* ─── Estilos dinámicos derivados del tema ─── */

  const inputStyle = [styles.input, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }];
  const inputErrorStyle = { borderColor: '#ff0000', backgroundColor: '#ff000010' };
  const passwordContainerStyle = [styles.passwordContainer, { backgroundColor: theme.background, borderColor: theme.border }];
  const gridOptionStyle = [styles.gridOption, { borderColor: theme.border }];
  const gridActiveStyle = { borderColor: theme.greenPrimary, backgroundColor: theme.greenPrimary };

  /* ─── Renderizado de pasos ─── */

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={[styles.mainContainer, { gap: 25 }]}>
            <View style={styles.fullnameContainer}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Nombre</Text>
                <TextInput
                  style={[inputStyle, errors.nombre && inputErrorStyle]}
                  placeholder="Tu nombre"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.nombre}
                  onChangeText={(text) => updateField('nombre', text)}
                  onBlur={() => validateField('nombre', formData.nombre)}
                  onSubmitEditing={() => apellidoRef.current?.focus()}
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Apellido</Text>
                <TextInput
                  ref={apellidoRef}
                  style={[inputStyle, errors.apellido && inputErrorStyle]}
                  placeholder="Tu apellido"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.apellido}
                  onChangeText={(text) => updateField('apellido', text)}
                  onBlur={() => validateField('apellido', formData.apellido)}
                  onSubmitEditing={() => emailRef.current?.focus()}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Correo electrónico</Text>
              <TextInput
                ref={emailRef}
                style={[inputStyle, errors.email && inputErrorStyle]}
                placeholder="tuemail@ejemplo.com"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                onBlur={() => validateField('email', formData.email)}
                onSubmitEditing={() => passwordRef.current?.focus()}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Contraseña</Text>
              <View style={[passwordContainerStyle, errors.password && inputErrorStyle]}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.passwordInput, { color: theme.textPrimary }]}
                  placeholder="Tu contraseña"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  onBlur={() => {
                    validateField('password', formData.password);
                    validateField('confirmPassword', formData.confirmPassword);
                  }}
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => formData.password && setShowPassword((v) => !v)}
                >
                  <Entypo
                    name={showPassword ? 'eye' : 'eye-with-line'}
                    size={24}
                    color={theme.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Confirmar contraseña</Text>
              <View style={[passwordContainerStyle, errors.confirmPassword && inputErrorStyle]}>
                <TextInput
                  ref={confirmPasswordRef}
                  style={[styles.passwordInput, { color: theme.textPrimary }]}
                  placeholder="Confirma tu contraseña"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField('confirmPassword', text)}
                  onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                  onSubmitEditing={handleNext}
                />
                <TouchableOpacity
                  onPress={() => formData.confirmPassword && setShowConfirmPassword((v) => !v)}
                >
                  <Entypo
                    name={showConfirmPassword ? 'eye' : 'eye-with-line'}
                    size={24}
                    color={theme.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={[styles.mainContainer, { gap: 25 }]}>
            <View>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Fecha de nacimiento</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, justifyContent: 'center' }, errors.birthDate && inputErrorStyle]}>
                  <Text style={{ color: theme.textPrimary }}>
                    {formData.birthDate.toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                maximumDate={minDate}
                minimumDate={maxDate}
                value={formData.birthDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (event.type === 'set' && selectedDate) {
                    updateField('birthDate', selectedDate);
                  }
                }}
              />
            )}

            <View>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Tipo de ingreso</Text>
              <View style={styles.grid}>
                {incomeTypes.map((type) => (
                  <TouchableOpacity key={type.id}
                    style={[
                      gridOptionStyle,
                      formData.incomeType === type.id && gridActiveStyle,
                    ]}
                    onPress={() => updateField('incomeType', type.id)}
                  >
                    <Text style={[styles.gridText, { color: theme.textPrimary }]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Ingreso mensual (CLP)</Text>
              <TextInput
                ref={incomeAmountRef}
                style={[inputStyle, errors.incomeAmount && inputErrorStyle]}
                placeholder="Ej: 800000"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={formData.incomeAmount}
                onChangeText={(text) => updateField('incomeAmount', text.replace(/[^0-9]/g, ''))}
                onBlur={() => validateField('incomeAmount', formData.incomeAmount)}
                onSubmitEditing={() => spentAmountRef.current?.focus()}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Gastos mensuales estimados (CLP)</Text>
              <TextInput
                ref={spentAmountRef}
                style={[inputStyle, errors.spentAmount && inputErrorStyle]}
                placeholder="Ej: 500000"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={formData.spentAmount}
                onChangeText={(text) => updateField('spentAmount', text.replace(/[^0-9]/g, ''))}
                onBlur={() => validateField('spentAmount', formData.spentAmount)}
                returnKeyType="done"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
              Selecciona todos los que aplican. Mínimo 1.
            </Text>
            <View style={styles.grid}>
              {Object.values(categoryMap).map((category: any) => {
                const isActive = formData.economicCategories.includes(category.id);

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[gridOptionStyle, isActive && gridActiveStyle]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text style={[styles.gridText, { color: theme.textPrimary }]}>
                      {category.name}
                    </Text>
                    <Text style={[styles.gridSubText, { color: theme.textSecondary }]}>
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Barra superior */}
      <View style={styles.topNavbar}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: theme.tabIconDefault }]}
        >
          <Ionicons name="arrow-back" size={32} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.progressBar}>
          <View style={styles.stepsContainer}>
            {/* Paso 1 */}
            <View style={[styles.progressStep, { borderColor: step >= 1 ? theme.greenPrimary : theme.border }, step > 1 && { backgroundColor: theme.greenPrimary }]}>
              {step > 1
                ? <Ionicons name="checkmark" size={32} color={'#ffffff'} />
                : <Feather name="user" size={28} color={theme.greenPrimary} />}
            </View>
            {/* Paso 2 */}
            <View style={[styles.progressStep, { borderColor: step >= 2 ? theme.greenPrimary : theme.border }, step > 2 && { backgroundColor: theme.greenPrimary }]}>
              {step > 2
                ? <Ionicons name="checkmark" size={32} color={'#ffffff'} />
                : <MaterialIcons name="attach-money" size={32} color={step >= 2 ? theme.greenPrimary : theme.textSecondary} />}
            </View>
            {/* Paso 3 */}
            <View style={[styles.progressStep, { borderColor: step >= 3 ? theme.greenPrimary : theme.border }]}>
              <Ionicons name="newspaper-outline" size={28} color={step >= 3 ? theme.greenPrimary : theme.textSecondary} />
            </View>
          </View>

          {/* Barra de progreso */}
          <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.greenPrimary, width: step === 1 ? '5%' : step === 2 ? '50%' : '100%' }]} />
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
          <Text style={[styles.position, { color: theme.greenPrimary }]}>Paso {step} de 3</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {step === 1 && 'Crea tu cuenta'}
            {step === 2 && 'Tu situación financiera'}
            {step === 3 && '¿Qué noticias te interesan?'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {step === 1 && 'Datos básicos para acceder a la app.'}
            {step === 2 && 'La IA usa esto para personalizar tus reportes.'}
            {step === 3 && 'Recibirás noticias relevantes según tus intereses.'}
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.cardBg }]}>
          {firstError !== '' && (
            <View style={[styles.errorBanner, { backgroundColor: '#ff000010' }]}>
              <Ionicons name="alert-circle-outline" size={24} color={'#ff0000'} />
              <Text style={[styles.errorText, { color: '#ff0000' }]}>{firstError}</Text>
            </View>
          )}
          {renderStep()}
        </View>
      </ScrollView>

      {/* Barra inferior */}
      <View style={[styles.footer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: theme.greenPrimary }]}
          onPress={step < 3 ? handleNext : handleRegister}
        >
          <Text style={styles.navButtonText}>{step < 3 ? 'Siguiente' : 'Crear cuenta'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 30,
    paddingHorizontal: 16,
  },

  backButton: {
    borderRadius: 100,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressBar: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
  },

  stepsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },

  progressStep: {
    width: 45,
    height: 45,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },

  progressTrack: {
    height: 4,
    width: '90%',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },

  position: {
    fontWeight: '800',
    fontSize: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },

  formCard: {
    borderRadius: 16,
    padding: 24,
  },

  errorBanner: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  errorText: {
    flex: 1,
  },

  mainContainer: {
    gap: 10,
  },

  fieldContainer: {
    gap: 4,
  },

  fullnameContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  inputContainer: {
    flex: 1,
    gap: 4,
  },

  inputLabel: {
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },

  passwordContainer: {
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },

  gridOption: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gridText: {
    fontWeight: '600',
    textAlign: 'center',
  },

  gridSubText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },

  footer: {
    borderTopWidth: 1,
    height: 80,
    padding: 16,
  },

  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
