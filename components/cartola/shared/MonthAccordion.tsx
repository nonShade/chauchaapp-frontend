import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { useState, useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { groupTransactionsByMonth } from '@/services/api/adapters';
import { updateTransaction } from '@/services/api/transactions';

interface MonthAccordionProps {
  transactions: Transaction[];
  summary?: any;
  onDelete?: (transactionId: string) => void;
  onRefresh?: () => void;
  isGroup?: boolean;
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
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

const isPending = (dateString: string, monthId: string): boolean => {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (monthId !== currentMonthKey) return false;
  const txDate = new Date(dateString);
  return txDate > now;
};

export default function MonthAccordion({ transactions, summary, onDelete, onRefresh, isGroup }: MonthAccordionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (item: Transaction, uniqueKey: string) => {
    setEditingId(uniqueKey);
    setEditDesc(item.description || '');
    setEditAmount(String(Math.round(item.amount)));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDesc('');
    setEditAmount('');
  };

  const handleSave = async (id: string) => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      Alert.alert('Error', 'El monto debe ser mayor a 0');
      return;
    }
    try {
      setIsSaving(true);
      await updateTransaction(id, {
        description: editDesc,
        amount: parseFloat(editAmount),
      } as any);
      setEditingId(null);
      onRefresh?.();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el registro');
    } finally {
      setIsSaving(false);
    }
  };
  const availableYears = useMemo(() => {
    const list: Transaction[] = Array.isArray(transactions)
      ? transactions
      : (transactions as any)?.data || (transactions as any)?.items || [];
    
    const years = new Set<number>();
    list.forEach(tx => {
      if (tx.date) years.add(new Date(tx.date).getFullYear());
    });
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || new Date().getFullYear());

  const groupedMonths = useMemo(() => {
    const list: Transaction[] = Array.isArray(transactions)
      ? transactions
      : (transactions as any)?.data || (transactions as any)?.items || [];

    const filteredList = list.filter(tx => {
      if (!tx.date) return false;
      return new Date(tx.date).getFullYear() === selectedYear;
    });

    const groups = groupTransactionsByMonth(filteredList);

    return groups;
  }, [transactions, summary, selectedYear]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Detalle por mes</Text>
        {availableYears.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity 
              onPress={() => setSelectedYear(prev => availableYears[availableYears.indexOf(prev) + 1] || prev)}
              disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
            >
              <Ionicons name="chevron-back" size={18} color={availableYears.indexOf(selectedYear) === availableYears.length - 1 ? APP_THEME.text.secondary + '40' : APP_THEME.text.secondary} />
            </TouchableOpacity>
            <Text style={{ color: APP_THEME.text.primary, fontWeight: 'bold' }}>{selectedYear}</Text>
            <TouchableOpacity 
              onPress={() => setSelectedYear(prev => availableYears[availableYears.indexOf(prev) - 1] || prev)}
              disabled={availableYears.indexOf(selectedYear) === 0}
            >
              <Ionicons name="chevron-forward" size={18} color={availableYears.indexOf(selectedYear) === 0 ? APP_THEME.text.secondary + '40' : APP_THEME.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.list}>
        {groupedMonths.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: APP_THEME.text.secondary }}>No hay movimientos registrados.</Text>
          </View>
        ) : (
          groupedMonths.map((month) => (
            <View key={month.id} style={[styles.accordionContainer, isGroup && { borderColor: APP_THEME.group.primary }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setExpandedId(expandedId === month.id ? null : month.id)}
              >
                <View style={styles.leftContent}>
                  <Ionicons
                    name={expandedId === month.id ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={isGroup ? APP_THEME.group.primary : APP_THEME.cards.balance.tagText}
                  />
                  <Ionicons name="calendar-outline" size={16} color={isGroup ? APP_THEME.group.primary : APP_THEME.cards.balance.tagText} />
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

                      {month.details.incomes.map((item, index) => {
                        const uniqueKey = `${item.id}-income-${index}`;
                        const isVirtual = item.id?.startsWith('virtual-');
                        const isEditing = editingId === uniqueKey;

                        return (
                          <View key={uniqueKey} style={styles.detailItem}>
                            <View style={styles.itemLeft}>
                              {isEditing ? (
                                <TextInput
                                  style={styles.inlineInput}
                                  value={editDesc}
                                  onChangeText={setEditDesc}
                                  autoFocus
                                />
                              ) : (
                                  <>
                                    <View style={styles.itemNameRow}>
                                      {isPending(item.date, month.id) && (
                                        <Ionicons name="time-outline" size={13} color={APP_THEME.cards.pending.text} />
                                      )}
                                      <Text style={[styles.detailItemName, isPending(item.date, month.id) && styles.pendingText]}>
                                        {isGroup ? 'Ingreso' : (item.description ? (item.category || 'Otros') : (item.category || 'Ingreso'))}
                                      </Text>
                                      {isPending(item.date, month.id) && (
                                        <View style={styles.pendingBadge}><Text style={styles.pendingBadgeText}>(Pendiente)</Text></View>
                                      )}
                                    </View>
                                    {item.description ? <Text style={styles.detailItemDescription}>{item.description}</Text> : <Text style={styles.detailItemDescription}>Sin descripción</Text>}
                                    <Text style={styles.detailItemDate}>{formatDate(item.date)}</Text>
                                  </>
                              )}
                            </View>
                            <View style={styles.detailItemRight}>
                              {isEditing ? (
                                <TextInput
                                  style={[styles.inlineInput, styles.amountInput]}
                                  value={editAmount}
                                  onChangeText={v => setEditAmount(v.replace(/[^0-9]/g, ''))}
                                  keyboardType="numeric"
                                />
                              ) : (
                                <Text style={[styles.detailItemAmount, { color: APP_THEME.cards.income.text }]}>
                                  +{formatCurrency(item.amount).substring(1)}
                                </Text>
                              )}

                              {!isVirtual && (
                                <View style={styles.actionsRow}>
                                  {isEditing ? (
                                    <>
                                      {isSaving ? (
                                        <ActivityIndicator size="small" color={APP_THEME.status.success} />
                                      ) : (
                                        <TouchableOpacity onPress={() => handleSave(item.id)}>
                                          <Ionicons name="checkmark-circle" size={22} color={APP_THEME.status.success} />
                                        </TouchableOpacity>
                                      )}
                                      <TouchableOpacity onPress={cancelEditing}>
                                        <Ionicons name="close-circle-outline" size={22} color={APP_THEME.text.secondary} />
                                      </TouchableOpacity>
                                    </>
                                  ) : (
                                    <>
                                      <TouchableOpacity style={styles.actionButton} onPress={() => startEditing(item, uniqueKey)}>
                                        <Ionicons name="pencil-outline" size={14} color={APP_THEME.text.secondary} />
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.actionButton} onPress={() => {
                                        const finalId = item.id || (item as any).transaction_id;
                                        console.log('[MonthAccordion] Requesting delete for:', finalId);
                                        onDelete?.(finalId);
                                      }}>
                                        <Ionicons name="trash-outline" size={14} color={APP_THEME.status.error} />
                                      </TouchableOpacity>
                                    </>
                                  )}
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
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

                      {month.details.expenses.map((item, index) => {
                        const uniqueKey = `${item.id}-expense-${index}`;
                        const isEditing = editingId === uniqueKey;

                        return (
                          <View key={uniqueKey} style={styles.detailItem}>
                            <View style={styles.itemLeft}>
                              {isEditing ? (
                                <TextInput
                                  style={styles.inlineInput}
                                  value={editDesc}
                                  onChangeText={setEditDesc}
                                  autoFocus
                                />
                              ) : (
                                  <>
                                    <View style={styles.itemNameRow}>
                                      {isPending(item.date, month.id) && (
                                        <Ionicons name="time-outline" size={13} color={APP_THEME.cards.pending.text} />
                                      )}
                                      <Text style={[styles.detailItemName, isPending(item.date, month.id) && styles.pendingText]}>
                                        {item.description ? (item.category || 'Otros') : (item.category || 'Gasto')}
                                      </Text>
                                      {isPending(item.date, month.id) && (
                                        <View style={styles.pendingBadge}><Text style={styles.pendingBadgeText}>(Pendiente)</Text></View>
                                      )}
                                    </View>
                                    {item.description ? <Text style={styles.detailItemDescription}>{item.description}</Text> : <Text style={styles.detailItemDescription}>Sin descripción</Text>}
                                    <Text style={styles.detailItemDate}>{formatDate(item.date)}</Text>
                                  </>
                              )}
                            </View>
                            <View style={styles.detailItemRight}>
                              {isEditing ? (
                                <TextInput
                                  style={[styles.inlineInput, styles.amountInput]}
                                  value={editAmount}
                                  onChangeText={v => setEditAmount(v.replace(/[^0-9]/g, ''))}
                                  keyboardType="numeric"
                                />
                              ) : (
                                <Text style={[styles.detailItemAmount, { color: APP_THEME.cards.expense.text }]}>
                                  -{formatCurrency(item.amount).substring(1)}
                                </Text>
                              )}

                              {(
                                <View style={styles.actionsRow}>
                                  {isEditing ? (
                                    <>
                                      {isSaving ? (
                                        <ActivityIndicator size="small" color={APP_THEME.status.success} />
                                      ) : (
                                        <TouchableOpacity onPress={() => handleSave(item.id)}>
                                          <Ionicons name="checkmark-circle" size={22} color={APP_THEME.status.success} />
                                        </TouchableOpacity>
                                      )}
                                      <TouchableOpacity onPress={cancelEditing}>
                                        <Ionicons name="close-circle-outline" size={22} color={APP_THEME.text.secondary} />
                                      </TouchableOpacity>
                                    </>
                                  ) : (
                                    <>
                                      <TouchableOpacity style={styles.actionButton} onPress={() => startEditing(item, uniqueKey)}>
                                        <Ionicons name="pencil-outline" size={14} color={APP_THEME.text.secondary} />
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.actionButton} onPress={() => {
                                        const finalId = item.id || (item as any).transaction_id;
                                        console.log('[MonthAccordion] Requesting delete for:', finalId);
                                        onDelete?.(finalId);
                                      }}>
                                        <Ionicons name="trash-outline" size={14} color={APP_THEME.status.error} />
                                      </TouchableOpacity>
                                    </>
                                  )}
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
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
  itemLeft: {
    flex: 1,
    marginRight: 8,
  },
  detailItemName: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  detailItemDescription: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineInput: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: APP_THEME.card.border,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: APP_THEME.text.secondary + '40',
  },
  amountInput: {
    width: 80,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  pendingText: {
    color: APP_THEME.cards.pending.text,
  },
  pendingBadge: {
    marginLeft: 2,
  },
  pendingBadgeText: {
    color: APP_THEME.cards.pending.text,
    fontSize: 10,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
