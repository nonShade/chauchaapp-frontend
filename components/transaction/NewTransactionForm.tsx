import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { getCategoryIcon, FREQUENCY_ICONS, NAV_ICONS } from '@/constants/icons';
import { LocalTransactionType, LocalFrequency } from '@/types/transaction';
import { GASTO_CATEGORIES, INGRESO_CATEGORIES } from '@/constants/categories';

export interface NewTransactionFormProps {
  type: LocalTransactionType;

  selectedCategory: string;
  onCategoryChange: (category: string) => void;

  amount: string;
  onAmountChange: (amount: string) => void;

  description: string;
  onDescriptionChange: (description: string) => void;

  date: string;
  onDateChange: (date: string) => void;
  formattedDate: string;

  frequency: LocalFrequency;
  onFrequencyChange: (frequency: LocalFrequency) => void;

  isGroupMode?: boolean;
}

export default function NewTransactionForm({
  type,
  selectedCategory,
  onCategoryChange,
  amount,
  onAmountChange,
  description,
  onDescriptionChange,
  date,
  onDateChange,
  formattedDate,
  frequency,
  onFrequencyChange,
  isGroupMode,
}: NewTransactionFormProps) {
  const isGasto = type === 'gasto';
  const hideCategory = isGroupMode && !isGasto;
  const categories = isGasto ? GASTO_CATEGORIES : INGRESO_CATEGORIES;
  const accentColor = isGasto ? APP_THEME.cards.expense.text : APP_THEME.cards.income.text;
  const accentBackground = isGasto ? APP_THEME.cards.expense.background : APP_THEME.cards.income.background;
  const dateLabel = isGasto ? 'Fecha del gasto' : 'Fecha del ingreso';
  const dateHint = isGasto ? 'Cuando se realizara el gasto' : 'Cuando recibirás el ingreso';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ---- Monto ---- */}
      <View style={styles.section}>
        <Text style={styles.label}>Monto (CLP)</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={val => onAmountChange(val.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={APP_THEME.text.secondary}
          />
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => onAmountChange(String(Math.max(0, parseInt(amount || '0') + 1000)))}
            >
              <Ionicons name="chevron-up" size={14} color={APP_THEME.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => onAmountChange(String(Math.max(0, parseInt(amount || '0') - 1000)))}
            >
              <Ionicons name="chevron-down" size={14} color={APP_THEME.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ---- Categoría ---- */}
      {!hideCategory && (
        <View style={styles.section}>
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryCard,
                    isSelected && { borderColor: accentColor, backgroundColor: accentColor + '18' },
                  ]}
                  onPress={() => onCategoryChange(isSelected ? '' : cat)}
                >
                  <Ionicons
                    name={getCategoryIcon(cat)}
                    size={24}
                    color={isSelected ? accentColor : APP_THEME.text.secondary}
                  />
                  <Text style={[styles.categoryName, isSelected && { color: accentColor }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ---- Descripción ---- */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Descripcion</Text>
          <Text style={styles.optional}> (opcional)</Text>
        </View>
        <TextInput
          style={styles.textInput}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Ej: Supermercado Lider"
          placeholderTextColor={APP_THEME.text.secondary}
        />
      </View>

      {/* ---- Fecha ---- */}
      <View style={styles.section}>
        <Text style={styles.label}>{dateLabel}</Text>
        <Text style={styles.subLabel}>{dateHint}</Text>
        <View style={styles.dateContainer}>
          <Ionicons name={NAV_ICONS.calendar} size={18} color={APP_THEME.text.secondary} />
          <TextInput
            style={[styles.dateText, { flex: 1, padding: 0 }]}
            value={date}
            onChangeText={onDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={APP_THEME.text.secondary + '80'}
            maxLength={10}
          />
          <Ionicons name={NAV_ICONS.calendarFill} size={18} color={APP_THEME.text.secondary} style={{ marginLeft: 'auto' }} />
        </View>
      </View>

      {/* ---- Frecuencia ---- */}
      <View style={styles.section}>
        <Text style={styles.label}>Frecuencia</Text>

        <TouchableOpacity
          style={[styles.frequencyCard, frequency === 'once' && { borderColor: accentColor, backgroundColor: accentBackground }]}
          onPress={() => onFrequencyChange('once')}
        >
          <View style={styles.frequencyHeader}>
            <Ionicons
              name={FREQUENCY_ICONS.once}
              size={18}
              color={frequency === 'once' ? accentColor : APP_THEME.text.secondary}
            />
            <Text style={[styles.frequencyTitle, frequency === 'once' && { color: accentColor }]}>
              Solo este mes
            </Text>
          </View>
          <Text style={styles.frequencyDesc}>Se registra una sola vez en el mes actual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.frequencyCard, frequency === 'monthly' && { borderColor: accentColor, backgroundColor: accentBackground }]}
          onPress={() => onFrequencyChange('monthly')}
        >
          <View style={styles.frequencyHeader}>
            <Ionicons
              name={FREQUENCY_ICONS.monthly}
              size={18}
              color={frequency === 'monthly' ? accentColor : APP_THEME.text.secondary}
            />
            <Text style={[styles.frequencyTitle, frequency === 'monthly' && { color: accentColor }]}>
              Mensual fijo
            </Text>
          </View>
          <Text style={styles.frequencyDesc}>Se repite todos los meses automaticamente</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 24, paddingBottom: 16 },
  section: { gap: 12 },
  label: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  optional: {
    color: APP_THEME.text.secondary,
    fontSize: 13,
  },
  subLabel: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
    marginTop: -6,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.card.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  currencySymbol: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountInput: {
    flex: 1,
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: '600',
    padding: 0,
  },
  stepperContainer: {
    borderLeftWidth: 1,
    borderLeftColor: APP_THEME.card.border,
    paddingLeft: 10,
  },
  stepperBtn: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '30%',
    paddingVertical: 16,
    backgroundColor: APP_THEME.card.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    color: APP_THEME.text.secondary,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: APP_THEME.text.primary,
    fontSize: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.card.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dateText: {
    color: APP_THEME.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  frequencyCard: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    padding: 14,
    gap: 6,
  },
  frequencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  frequencyTitle: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  frequencyDesc: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
    lineHeight: 17,
  },
});
