import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { DistributionData } from '@/types/transaction';

interface CategoryExpensesProps {
  distribution: DistributionData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CategoryExpenses({ distribution }: CategoryExpensesProps) {
  const primaryGreen = APP_THEME.button.primary.background;

  // Ordenar de mayor a menor gasto
  const sortedDistribution = [...distribution].sort((a, b) => b.amount - a.amount);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wallet-outline" size={22} color={primaryGreen} />
        <Text style={styles.title}>Gastos personales</Text>
      </View>
      
      <View style={styles.list}>
        {sortedDistribution.length === 0 ? (
          <Text style={{ color: APP_THEME.text.secondary, paddingVertical: 10 }}>No hay datos de gastos.</Text>
        ) : (
          sortedDistribution.map((item, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Ionicons 
                    name="pricetag-outline" 
                    size={18} 
                    color={APP_THEME.text.secondary} 
                  />
                  <Text style={styles.itemName}>{item.category}</Text>
                </View>
                <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${item.percentage}%`, 
                      backgroundColor: primaryGreen 
                    }
                  ]} 
                />
              </View>
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
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  title: {
    color: APP_THEME.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    gap: 22,
  },
  item: {
    gap: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemName: {
    color: APP_THEME.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  itemAmount: {
    color: APP_THEME.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: APP_THEME.card.progressBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
