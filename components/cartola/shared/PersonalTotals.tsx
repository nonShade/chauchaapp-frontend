import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { SummaryResponse } from '@/types/transaction';

interface PersonalTotalsProps {
  summary: SummaryResponse | null;
  isGroup?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function PersonalTotals({ summary, isGroup }: PersonalTotalsProps) {
  const income = summary?.total_income || 0;
  const expense = summary?.total_expenses || 0;
  const balance = summary?.total_balance || 0;

  return (
    <View style={[styles.container, isGroup && { borderColor: APP_THEME.group.primary }]}>
      <View style={styles.header}>
        <Ionicons name={isGroup ? "people-outline" : "person-outline"} size={16} color={isGroup ? APP_THEME.group.primary : APP_THEME.cards.balance.tagText} />
        <Text style={[styles.title, isGroup && { color: APP_THEME.group.primary }]}>{isGroup ? 'Totales Grupales' : 'Totales Personales'}</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Ingresos</Text>
          <Text style={[styles.amount, { color: APP_THEME.cards.income.text }]}>{formatCurrency(income)}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Gastos</Text>
          <Text style={[styles.amount, { color: APP_THEME.cards.expense.text }]}>{formatCurrency(expense)}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Balance</Text>
          <Text style={[styles.amount, { color: balance < 0 ? APP_THEME.cards.expense.text : APP_THEME.cards.income.text }]}>{formatCurrency(balance)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_THEME.card.background,
    borderWidth: 1,
    borderColor: APP_THEME.cards.balance.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    color: APP_THEME.cards.balance.tagText,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  label: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
