import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';

const TRANSACTIONS = [
  { id: 1, name: 'Sueldo', date: '28-02-2026', amount: '+$850.000', type: 'income' },
  { id: 2, name: 'Arriendo', date: '04-03-2026', amount: '-$350.000', type: 'expense' },
  { id: 3, name: 'Servicios', date: '09-03-2026', amount: '-$45.000', type: 'expense' },
  { id: 4, name: 'Alimentación', date: '07-03-2026', amount: '-$180.000', type: 'expense' },
];

export default function RecentTransactions() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-outline" size={18} color={APP_THEME.cards.balance.tagText} />
        <Text style={styles.title}>Últimos movimientos personales</Text>
      </View>
      
      <View style={styles.list}>
        {TRANSACTIONS.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.leftContent}>
              <View style={[
                styles.iconContainer, 
                { backgroundColor: item.type === 'income' ? APP_THEME.cards.income.background : APP_THEME.cards.expense.background }
              ]}>
                <Ionicons 
                  name="ellipsis-horizontal" 
                  size={12} 
                  color={item.type === 'income' ? APP_THEME.cards.income.text : APP_THEME.cards.expense.text} 
                />
              </View>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={10} color={APP_THEME.text.secondary} />
                  <Text style={styles.itemDate}>{item.date}</Text>
                </View>
              </View>
            </View>
            <Text style={[
              styles.itemAmount, 
              { color: item.type === 'income' ? APP_THEME.cards.income.text : APP_THEME.text.primary }
            ]}>
              {item.amount}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    gap: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemDate: {
    color: APP_THEME.text.secondary,
    fontSize: 11,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
