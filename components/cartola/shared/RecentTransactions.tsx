import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { Transaction } from '@/types/transaction';
import { normalizeTransaction } from '@/services/api/adapters';
import { useState } from 'react';
import { updateTransaction } from '@/services/api/transactions';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onRefresh?: () => void;
  onDelete?: (transactionId: string) => void;
  isGroup?: boolean;
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

export default function RecentTransactions({ transactions, onRefresh, onDelete, isGroup }: RecentTransactionsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (item: Transaction) => {
    setEditingId(item.id);
    setEditDesc(item.description || '');
    setEditAmount(String(Math.round(item.amount)));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsSaving(false);
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
        amount: parseFloat(editAmount)
      } as any);
      setEditingId(null);
      onRefresh?.();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el registro');
    } finally {
      setIsSaving(false);
    }
  };
  const list = Array.isArray(transactions)
    ? transactions
    : (transactions as any)?.data ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={isGroup ? "people-outline" : "person-outline"} size={18} color={APP_THEME.cards.balance.tagText} />
        <Text style={styles.title}>{isGroup ? "Últimos movimientos del grupo" : "Últimos movimientos personales"}</Text>
      </View>

      <View style={styles.list}>
        {list.length === 0 ? (
          <Text style={{ color: APP_THEME.text.secondary }}>No hay transacciones recientes.</Text>
        ) : (
          list.slice(0, 5).map((item: Transaction) => {
            const isEditing = editingId === item.id;
            return (
              <View key={item.id} style={styles.item}>
                <View style={styles.leftContent}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: item.type === 'INCOME' ? APP_THEME.cards.income.background : APP_THEME.cards.expense.background }
                  ]}>
                    <Ionicons
                      name={item.type === 'INCOME' ? 'trending-up' : 'trending-down'}
                      size={12}
                      color={item.type === 'INCOME' ? APP_THEME.cards.income.text : APP_THEME.cards.expense.text}
                    />
                  </View>
                  <View style={styles.itemMeta}>
                    {isEditing ? (
                      <TextInput
                        style={styles.inlineInput}
                        value={editDesc}
                        onChangeText={setEditDesc}
                        autoFocus
                      />
                    ) : (
                      <>
                        <Text style={styles.itemName}>{item.category || (item as any).category_name || 'Otros'}</Text>
                        {isGroup && (item as any).user_name ? (
                          <Text style={styles.itemDescription}>Por: {(item as any).user_name}</Text>
                        ) : null}
                        {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
                        <View style={styles.dateRow}>
                          <Ionicons name="calendar-outline" size={10} color={APP_THEME.text.secondary} />
                          <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.rightContent}>
                  {isEditing ? (
                    <TextInput
                      style={[styles.inlineInput, styles.amountInput]}
                      value={editAmount}
                      onChangeText={v => setEditAmount(v.replace(/[^0-9]/g, ''))}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={[
                      styles.itemAmount,
                      { color: item.type === 'INCOME' ? APP_THEME.status.success : APP_THEME.text.primary }
                    ]}>
                      {item.type === 'INCOME' ? '+ ' : '- '}{formatCurrency(item.amount)}
                    </Text>
                  )}

                  <View style={styles.actionsRow}>
                    {!isGroup && (
                      isEditing ? (
                        <>
                          {isSaving ? (
                            <ActivityIndicator size="small" color={APP_THEME.status.success} />
                          ) : (
                            <TouchableOpacity onPress={() => handleSave(item.id)}>
                              <Ionicons name="checkmark-circle" size={20} color={APP_THEME.status.success} />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={cancelEditing}>
                            <Ionicons name="close-circle-outline" size={20} color={APP_THEME.text.secondary} />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity style={styles.actionBtn} onPress={() => startEditing(item)}>
                            <Ionicons name="pencil-outline" size={13} color={APP_THEME.text.secondary} />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.actionBtn} onPress={() => {
                            const finalId = item.id || (item as any).transaction_id;
                            console.log('[RecentTransactions] Requesting delete for:', finalId);
                            onDelete?.(finalId);
                          }}>
                            <Ionicons name="trash-outline" size={13} color={APP_THEME.status.error} />
                          </TouchableOpacity>
                        </>
                      )
                    )}
                  </View>
                </View>
              </View>
            );
          })
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
    flex: 1,
    marginRight: 8,
  },
  itemMeta: {
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemDescription: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
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
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionBtn: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineInput: {
    color: APP_THEME.text.primary,
    fontSize: 13,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: APP_THEME.card.border,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: APP_THEME.text.secondary + '30',
  },
  amountInput: {
    width: 65,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});
