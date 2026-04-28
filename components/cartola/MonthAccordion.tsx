import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { useState } from 'react';

const MONTHS = [
  {
    id: 1,
    name: 'Marzo 2026',
    amount: '$-775.000',
    isPositive: false,
    details: {
      incomeAmount: '$1.000.000',
      expenseAmount: '$847.000',
      incomes: [
        { id: 101, name: 'Sueldo', date: '28-02-2026', amount: '+$850.000' },
        { id: 102, name: 'Bonificación', date: '14-02-2026', amount: '+$150.000' }
      ],
      expenses: [
        { id: 201, name: 'Arriendo', date: '04-02-2026', amount: '-$350.000' },
        { id: 202, name: 'Servicios', date: '09-02-2026', amount: '-$52.000' },
      ]
    }
  },
  { id: 2, name: 'Febrero 2026', amount: '+$153.000', isPositive: true },
  { id: 3, name: 'Enero 2026', amount: '+$12.000', isPositive: true },
  { id: 4, name: 'Diciembre 2025', amount: '+$333.000', isPositive: true },
];

export default function MonthAccordion() {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Detalle por mes</Text>

      <View style={styles.list}>
        {MONTHS.map((month) => (
          <View key={month.id} style={styles.accordionContainer}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setExpandedId(expandedId === month.id ? null : month.id)}
            >
              <View style={styles.leftContent}>
                <Ionicons
                  name={expandedId === month.id ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={APP_THEME.cards.balance.tagText}
                />
                <Ionicons name="person-outline" size={16} color={APP_THEME.cards.balance.tagText} />
                <Text style={styles.monthName}>{month.name}</Text>
              </View>
              <Text style={[
                styles.amount,
                { color: month.isPositive ? APP_THEME.cards.income.text : APP_THEME.cards.expense.text }
              ]}>
                {month.amount}
              </Text>
            </TouchableOpacity>

            {/* Contenido si se expande */}
            {expandedId === month.id && month.details && (
              <View style={styles.expandedContent}>

                {/* Cards de resumen */}
                <View style={styles.summaryCardsRow}>
                  <View style={[styles.miniSummaryCard, { backgroundColor: APP_THEME.cards.income.background, borderColor: APP_THEME.cards.income.border }]}>
                    <Text style={styles.miniSummaryLabel}>Ingresos</Text>
                    <Text style={[styles.miniSummaryAmount, { color: APP_THEME.cards.income.text }]}>{month.details.incomeAmount}</Text>
                  </View>
                  <View style={[styles.miniSummaryCard, { backgroundColor: APP_THEME.cards.expense.background, borderColor: APP_THEME.cards.expense.border }]}>
                    <Text style={styles.miniSummaryLabel}>Gastos</Text>
                    <Text style={[styles.miniSummaryAmount, { color: APP_THEME.cards.expense.text }]}>{month.details.expenseAmount}</Text>
                  </View>
                </View>

                {/* Lista de ingresos */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailsSectionHeader}>
                    <Ionicons name="trending-up" size={14} color={APP_THEME.cards.income.text} />
                    <Text style={[styles.detailsSectionTitle, { color: APP_THEME.cards.income.text }]}>Ingresos ({month.details.incomes.length})</Text>
                  </View>

                  {month.details.incomes.map(item => (
                    <View key={item.id} style={styles.detailItem}>
                      <View>
                        <Text style={styles.detailItemName}>{item.name}</Text>
                        <Text style={styles.detailItemDate}>{item.date}</Text>
                      </View>
                      <View style={styles.detailItemRight}>
                        <Text style={[styles.detailItemAmount, { color: APP_THEME.cards.income.text }]}>{item.amount}</Text>
                        <TouchableOpacity style={styles.actionButton}><Ionicons name="pencil-outline" size={14} color={APP_THEME.text.secondary} /></TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}><Ionicons name="trash-outline" size={14} color={APP_THEME.status.error} /></TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Lista de gastos */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailsSectionHeader}>
                    <Ionicons name="trending-down" size={14} color={APP_THEME.cards.expense.text} />
                    <Text style={[styles.detailsSectionTitle, { color: APP_THEME.cards.expense.text }]}>Gastos ({month.details.expenses.length})</Text>
                  </View>

                  {month.details.expenses.map(item => (
                    <View key={item.id} style={styles.detailItem}>
                      <View>
                        <Text style={styles.detailItemName}>{item.name}</Text>
                        <Text style={styles.detailItemDate}>{item.date}</Text>
                      </View>
                      <View style={styles.detailItemRight}>
                        <Text style={[styles.detailItemAmount, { color: APP_THEME.cards.expense.text }]}>{item.amount}</Text>
                        <TouchableOpacity style={styles.actionButton}><Ionicons name="pencil-outline" size={14} color={APP_THEME.text.secondary} /></TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}><Ionicons name="trash-outline" size={14} color={APP_THEME.status.error} /></TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>

              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  accordionContainer: {
    backgroundColor: APP_THEME.card.background,
    borderWidth: 1,
    borderColor: APP_THEME.cards.balance.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthName: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: APP_THEME.card.border,
  },
  summaryCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  miniSummaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  miniSummaryLabel: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  miniSummaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  detailsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailItemName: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailItemDate: {
    color: APP_THEME.text.secondary,
    fontSize: 11,
  },
  detailItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailItemAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  actionButton: {
    padding: 4,
  },
});
