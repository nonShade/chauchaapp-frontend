import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { Transaction } from '@/types/transaction';
import { normalizeTransaction } from '@/services/api/adapters';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const rawList = Array.isArray(transactions)
    ? transactions
    : (transactions as any)?.data ?? [];

  const list = rawList.map(normalizeTransaction);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-outline" size={18} color={APP_THEME.cards.balance.tagText} />
        <Text style={styles.title}>Últimos movimientos personales</Text>
      </View>

      <View style={styles.list}>
        {list.length === 0 ? (
          <Text style={{ color: APP_THEME.text.secondary }}>No hay transacciones recientes.</Text>
        ) : (
          list.slice(0, 5).map((item: Transaction) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.leftContent}>
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: item.type === 'INCOME' ? APP_THEME.cards.income.background : APP_THEME.cards.expense.background }
                ]}>
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={12}
                    color={item.type === 'INCOME' ? APP_THEME.cards.income.text : APP_THEME.cards.expense.text}
                  />
                </View>
                <View>
                  <Text style={styles.itemName}>{item.description}</Text>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={10} color={APP_THEME.text.secondary} />
                    <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
                  </View>
                </View>
              </View>
              <Text style={[
                styles.itemAmount,
                { color: item.type === 'INCOME' ? APP_THEME.cards.income.text : APP_THEME.text.primary }
              ]}>
                {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
              </Text>
            </View>
          ))
        )}
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
