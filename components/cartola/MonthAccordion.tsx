import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { useState, useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { groupTransactionsByMonth } from '@/services/api/adapters';

interface MonthAccordionProps {
  transactions: Transaction[];
  summary?: any;
}

const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(absValue);
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
};

export default function MonthAccordion({ transactions, summary }: MonthAccordionProps) {
  const groupedMonths = useMemo(() => {
    const list: Transaction[] = Array.isArray(transactions)
      ? transactions
      : (transactions as any)?.data || (transactions as any)?.items || [];

    const groups = groupTransactionsByMonth(list);

    if (summary && groups.length > 0) {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const currentMonthGroup = groups.find(g => g.id === currentMonthKey);

      if (currentMonthGroup) {
        const backendIncome = Number(summary.total_income) || 0;
        const listIncome = currentMonthGroup.details.incomeAmount;

        if (backendIncome > listIncome) {
          const diff = backendIncome - listIncome;
          currentMonthGroup.details.incomes.push({
            id: 'virtual-income-' + currentMonthKey,
            description: 'Ingresos registrados',
            amount: diff,
            type: 'INCOME',
            date: now.toISOString(),
            category: 'General'
          } as Transaction);
          currentMonthGroup.details.incomeAmount = backendIncome;
          currentMonthGroup.amount = backendIncome - currentMonthGroup.details.expenseAmount;
          currentMonthGroup.isPositive = currentMonthGroup.amount >= 0;
        }
      }
    }

    return groups;
  }, [transactions, summary]);

  const [expandedId, setExpandedId] = useState<string | null>(groupedMonths[0]?.id || null);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Detalle por mes</Text>

      <View style={styles.list}>
        {groupedMonths.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: APP_THEME.text.secondary }}>No hay movimientos registrados.</Text>
          </View>
        ) : (
          groupedMonths.map((month) => (
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
                  <Ionicons name="calendar-outline" size={16} color={APP_THEME.cards.balance.tagText} />
                  <Text style={styles.monthName}>{month.name}</Text>
                </View>
                <Text style={[
                  styles.amount,
                  { color: month.isPositive ? APP_THEME.cards.income.text : APP_THEME.cards.expense.text }
                ]}>
                  {formatCurrency(month.amount)}
                </Text>
              </TouchableOpacity>

              {/* Contenido si se expande */}
              {expandedId === month.id && (
                <View style={styles.expandedContent}>

                  {/* Cards de resumen */}
                  <View style={styles.summaryCardsRow}>
                    <View style={[styles.miniSummaryCard, { backgroundColor: APP_THEME.cards.income.background, borderColor: APP_THEME.cards.income.border }]}>
                      <Text style={styles.miniSummaryLabel}>Ingresos</Text>
                      <Text style={[styles.miniSummaryAmount, { color: APP_THEME.cards.income.text }]}>
                        {formatCurrency(month.details.incomeAmount)}
                      </Text>
                    </View>
                    <View style={[styles.miniSummaryCard, { backgroundColor: APP_THEME.cards.expense.background, borderColor: APP_THEME.cards.expense.border }]}>
                      <Text style={styles.miniSummaryLabel}>Gastos</Text>
                      <Text style={[styles.miniSummaryAmount, { color: APP_THEME.cards.expense.text }]}>
                        {formatCurrency(-month.details.expenseAmount)}
                      </Text>
                    </View>
                  </View>

                  {/* Lista de ingresos */}
                  {month.details.incomes.length > 0 && (
                    <View style={styles.detailsSection}>
                      <View style={styles.detailsSectionHeader}>
                        <Ionicons name="trending-up" size={14} color={APP_THEME.cards.income.text} />
                        <Text style={[styles.detailsSectionTitle, { color: APP_THEME.cards.income.text }]}>
                          Ingresos ({month.details.incomes.length})
                        </Text>
                      </View>

                      {month.details.incomes.map(item => (
                        <View key={item.id} style={styles.detailItem}>
                          <View>
                            <Text style={styles.detailItemName}>{item.description || item.category}</Text>
                            <Text style={styles.detailItemDate}>{formatDate(item.date)}</Text>
                          </View>
                          <View style={styles.detailItemRight}>
                            <Text style={[styles.detailItemAmount, { color: APP_THEME.cards.income.text }]}>
                              +{formatCurrency(item.amount).substring(1)}
                            </Text>
                            <TouchableOpacity style={styles.actionButton}><Ionicons name="pencil-outline" size={14} color={APP_THEME.text.secondary} /></TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}><Ionicons name="trash-outline" size={14} color={APP_THEME.status.error} /></TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Lista de gastos */}
                  {month.details.expenses.length > 0 && (
                    <View style={styles.detailsSection}>
                      <View style={styles.detailsSectionHeader}>
                        <Ionicons name="trending-down" size={14} color={APP_THEME.cards.expense.text} />
                        <Text style={[styles.detailsSectionTitle, { color: APP_THEME.cards.expense.text }]}>
                          Gastos ({month.details.expenses.length})
                        </Text>
                      </View>

                      {month.details.expenses.map(item => (
                        <View key={item.id} style={styles.detailItem}>
                          <View>
                            <Text style={styles.detailItemName}>{item.description || item.category}</Text>
                            <Text style={styles.detailItemDate}>{formatDate(item.date)}</Text>
                          </View>
                          <View style={styles.detailItemRight}>
                            <Text style={[styles.detailItemAmount, { color: APP_THEME.cards.expense.text }]}>
                              -{formatCurrency(item.amount).substring(1)}
                            </Text>
                            <TouchableOpacity style={styles.actionButton}><Ionicons name="pencil-outline" size={14} color={APP_THEME.text.secondary} /></TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}><Ionicons name="trash-outline" size={14} color={APP_THEME.status.error} /></TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                </View>
              )}
            </View>
          ))
        )}
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
  emptyContainer: {
    padding: 20,
    backgroundColor: APP_THEME.card.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    alignItems: 'center',
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
