import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { APP_THEME } from '@/constants/themes';
import NewTransactionForm from '@/components/transaction/NewTransactionForm';
import { createTransaction } from '@/services/api/transactions';

export default function NewTransactionScreen() {
  const [isGasto, setIsGasto] = useState(true);
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Por favor, ingresa un monto válido.');
      return;
    }

    const payload = {
      amount: parseFloat(amount),
      transaction_type_id: isGasto ? 'b9fe72a5-c519-4d16-b99b-7ffd18ec61ab' : '3d43d395-866d-4952-b88d-e64e9e03d406',
      transaction_date: new Date().toISOString(),
    };

    try {
      setIsSaving(true);
      await createTransaction(payload as any);
      router.back();
    } catch (err: any) {
      setErrorMsg('Error al guardar. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={APP_THEME.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo Registro</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <NewTransactionForm
            isGasto={isGasto}
            onTypeChange={setIsGasto}
            amount={amount}
            onAmountChange={setAmount}
          />

          {errorMsg && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={APP_THEME.status.alerts.errorText} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isGasto ? APP_THEME.status.error : APP_THEME.status.success }]}
            onPress={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-sharp" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Guardar Registro</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: APP_THEME.input.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 30,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: APP_THEME.status.alerts.errorBg,
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: APP_THEME.status.alerts.errorText,
    fontSize: 13,
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 18,
    gap: 10,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});