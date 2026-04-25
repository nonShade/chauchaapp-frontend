import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Validación de email
  const validateEmail = (value: string) => {
    if (!value) return 'El correo es obligatorio';
    // Regex simple para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Correo electrónico inválido';
    return '';
  };

  // Validación de contraseña
  const validatePassword = (value: string) => {
    if (!value) return 'La contraseña es obligatoria';
    return '';
  };


  // El botón siempre está habilitado, pero muestra errores si hay
  const isFormValid = !validateEmail(email) && !validatePassword(password);


  const handleLogin = () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrorEmail(emailErr);
    setErrorPassword(passErr);
    if (emailErr || passErr) return;
    // Aquí iría la lógica de autenticación
    router.replace('/(tabs)');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo-chauchapp.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: theme.textPrimary }]}>
            ChauchApp
          </Text>
          <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>
            Tu asistente financiero personal
          </Text>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.formTitle, { color: theme.textPrimary }]}>
            Iniciar sesión
          </Text>
          <Text style={[styles.formSubtitle, { color: theme.textSecondary }]}>
            Ingresa con tu cuenta para continuar
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Correo electrónico</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  color: theme.textPrimary,
                  borderColor: errorEmail && emailTouched ? '#E53935' : theme.border,
                },
              ]}
              placeholder="tuemail@ejemplo.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (emailTouched) setErrorEmail(validateEmail(text));
              }}
              onBlur={() => {
                setEmailTouched(true);
                setErrorEmail(validateEmail(email));
              }}
            />
            {errorEmail && emailTouched ? (
              <Text style={styles.errorText}>{errorEmail}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Contraseña</Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  backgroundColor: theme.background,
                  borderColor: errorPassword && passwordTouched ? '#E53935' : theme.border,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="Tu contraseña"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={text => {
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
                <Text style={{ color: theme.icon }}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
            {errorPassword && passwordTouched ? (
              <Text style={styles.errorText}>{errorPassword}</Text>
            ) : null}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.greenPrimary }]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: theme.textSecondary }]}>
              ¿No tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={[styles.registerLink, { color: theme.greenPrimary }]}>
                Registrate gratis
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  formCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  passwordContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    fontWeight: '400',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});
