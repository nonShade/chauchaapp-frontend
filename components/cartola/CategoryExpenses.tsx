import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';

const EXPENSES = [
  { id: 1, name: 'Arriendo', amount: '$1.400.000', progress: 0.4, icon: 'home-outline' },
  { id: 2, name: 'Alimentación', amount: '$820.000', progress: 0.3, icon: 'restaurant-outline' },
  { id: 3, name: 'Crédito', amount: '$480.000', progress: 0.2, icon: 'card-outline' },
  { id: 4, name: 'Transporte', amount: '$245.000', progress: 0.1, icon: 'car-outline' },
  { id: 5, name: 'Entretenimiento', amount: '$235.000', progress: 0.1, icon: 'film-outline' },
  { id: 6, name: 'Servicios', amount: '$187.000', progress: 0.08, icon: 'flash-outline' },
];

export default function CategoryExpenses() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wallet-outline" size={20} color={APP_THEME.cards.balance.tagText} />
        <Text style={styles.title}>Gastos personales</Text>
      </View>
      
      <View style={styles.list}>
        {EXPENSES.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Ionicons name={item.icon as any} size={16} color={APP_THEME.text.secondary} />
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <Text style={styles.itemAmount}>{item.amount}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
            </View>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    gap: 16,
  },
  item: {
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    color: APP_THEME.text.primary,
    fontSize: 14,
  },
  itemAmount: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#1D232C',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: APP_THEME.cards.income.text,
  },
});
