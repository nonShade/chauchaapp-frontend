import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { APP_THEME } from '@/constants/themes';

interface NewTransactionFormProps {
  isGasto: boolean;
  onTypeChange: (isGasto: boolean) => void;
  amount: string;
  onAmountChange: (value: string) => void;
}

export default function NewTransactionForm({
  isGasto,
  onTypeChange,
  amount,
  onAmountChange,
}: NewTransactionFormProps) {
  const activeColor = isGasto ? APP_THEME.status.error : APP_THEME.status.success;

  return (
    <View style={styles.container}>
      {/* Selector de Tipo */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isGasto && { backgroundColor: APP_THEME.status.error + '20' }]}
          onPress={() => onTypeChange(true)}
        >
          <Text style={[styles.toggleText, { color: isGasto ? APP_THEME.status.error : APP_THEME.text.secondary }]}>
            Gasto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, !isGasto && { backgroundColor: APP_THEME.status.success + '20' }]}
          onPress={() => onTypeChange(false)}
        >
          <Text style={[styles.toggleText, { color: !isGasto ? APP_THEME.status.success : APP_THEME.text.secondary }]}>
            Ingreso
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input de Monto */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Monto</Text>
        <View style={styles.amountInputContainer}>
          <Text style={[styles.currencySymbol, { color: activeColor }]}>$</Text>
          <TextInput
            style={[styles.amountInput, { color: activeColor }]}
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={activeColor + '40'}
            autoFocus
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: APP_THEME.input.background,
    borderRadius: 16,
    padding: 6,
    gap: 6,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleText: {
    fontWeight: '600',
    fontSize: 14,
  },
  inputSection: {
    gap: 8,
  },
  label: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.input.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: APP_THEME.input.border,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    padding: 0,
  },
});
