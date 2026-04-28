import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';

const CHART_DATA = [
  { label: 'Nov', income: 0.6, expense: 0 },
  { label: 'Dic', income: 0.9, expense: 0.7 },
  { label: 'Ene', income: 0.6, expense: 0.6 },
  { label: 'Feb', income: 0.7, expense: 0.6 },
  { label: 'Mar', income: 0, expense: 0.55 },
];

export default function PersonalSummaryChart() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bar-chart-outline" size={18} color={APP_THEME.cards.balance.tagText} />
        <Text style={styles.title}>Resumen Personal</Text>
      </View>
      <Text style={styles.subtitle}>Ingresos vs Gastos</Text>

      <View style={styles.chartArea}>
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>1400k</Text>
          <Text style={styles.yAxisLabel}>1050k</Text>
          <Text style={styles.yAxisLabel}>700k</Text>
          <Text style={styles.yAxisLabel}>350k</Text>
          <Text style={styles.yAxisLabel}>0k</Text>
        </View>

        <View style={styles.barsContainer}>
          {CHART_DATA.map((item, index) => (
            <View key={index} style={styles.monthCol}>
              <View style={styles.barGroup}>
                {item.income > 0 && (
                  <View style={[styles.bar, { height: `${item.income * 100}%`, backgroundColor: APP_THEME.cards.income.text }]} />
                )}
                {item.expense > 0 && (
                  <View style={[styles.bar, { height: `${item.expense * 100}%`, backgroundColor: APP_THEME.cards.expense.text }]} />
                )}
              </View>
              <Text style={styles.xAxisLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: APP_THEME.cards.income.text }]} />
          <Text style={styles.legendText}>Ingresos</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: APP_THEME.cards.expense.text }]} />
          <Text style={styles.legendText}>Gastos</Text>
        </View>
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
    gap: 8,
    marginBottom: 4,
  },
  title: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
    marginBottom: 24,
  },
  chartArea: {
    flexDirection: 'row',
    height: 180,
    marginBottom: 20,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 12,
    alignItems: 'flex-end',
  },
  yAxisLabel: {
    color: APP_THEME.text.secondary,
    fontSize: 10,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_THEME.card.border,
  },
  monthCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 4,
    paddingBottom: 4,
  },
  bar: {
    width: 14,
    borderRadius: 4,
  },
  xAxisLabel: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
    position: 'absolute',
    bottom: -16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
  },
});
