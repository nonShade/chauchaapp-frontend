import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { APP_THEME } from '@/constants/themes';

const GASTO_CATEGORIES = [
  'Vivienda', 'Alimentación', 'Transporte', 'Servicios',
  'Salud', 'Entretenimiento', 'Educación', 'Vestuario',
  'Créditos', 'Ahorro', 'Otros'
];

const INGRESO_CATEGORIES = ['Sueldo', 'Venta', 'Inversión', 'Otros'];

interface NewTransactionFormProps {
  isGasto: boolean;
  onTypeChange: (isGasto: boolean) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function NewTransactionForm({
  isGasto,
  onTypeChange,
  amount,
  onAmountChange,
  selectedCategory,
  onCategoryChange,
}: NewTransactionFormProps) {
  const activeColor = isGasto ? APP_THEME.status.error : APP_THEME.status.success;
  const categories = isGasto ? GASTO_CATEGORIES : INGRESO_CATEGORIES;

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
          />
        </View>
      </View>

      {/* Selector de Categoría */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Categoría (Obligatorio)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && { backgroundColor: activeColor, borderColor: activeColor }
              ]}
              onPress={() => onCategoryChange(cat)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && { color: '#fff' }
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  categoryScroll: {
    gap: 10,
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_THEME.input.border,
    backgroundColor: APP_THEME.input.background,
  },
  categoryText: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
