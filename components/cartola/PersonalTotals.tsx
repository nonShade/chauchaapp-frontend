import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';

export default function PersonalTotals() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-outline" size={16} color={APP_THEME.cards.balance.tagText} />
        <Text style={styles.title}>Totales Personales</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Ingresos</Text>
          <Text style={[styles.amount, { color: APP_THEME.cards.income.text }]}>$3.975.000</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Gastos</Text>
          <Text style={[styles.amount, { color: APP_THEME.cards.expense.text }]}>$3.402.000</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Balance</Text>
          <Text style={[styles.amount, { color: APP_THEME.cards.income.text }]}>$573.000</Text>
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
