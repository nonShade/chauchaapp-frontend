import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Platform,
  KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { APP_THEME } from '@/constants/themes';
import NewTransactionForm from '@/components/transaction/NewTransactionForm';
import {
  getTransactionTypes,
  getTransactionCategories,
  getTransactionFrequencies,
  createTransaction,
  updateTransaction,
} from '@/services/api/transactions';
import { LocalTransactionType, LocalFrequency } from '@/types/transaction';

const todayISO = () => new Date().toISOString().split('T')[0];

const formatDateDisplay = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d} / ${m} / ${y}`;
};

export default function NewTransactionScreen() {
  const { id: editId, mode, group } = useLocalSearchParams<{ id?: string; mode?: string; group?: string }>();
  const isEditMode = mode === 'edit' && !!editId;
  const isGroupMode = group === 'true';

  const [gastoTypeId, setGastoTypeId] = useState('');
  const [ingresoTypeId, setIngresoTypeId] = useState('');
  const [onceFreqId, setOnceFreqId] = useState('');
  const [monthlyFreqId, setMonthlyFreqId] = useState('');
  const [categoryUUIDs, setCategoryUUIDs] = useState<Record<string, string>>({});
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [type, setType] = useState<LocalTransactionType>('gasto');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date] = useState(todayISO());
  const [frequency, setFrequency] = useState<LocalFrequency>('once');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isGasto = type === 'gasto';
  const pageTitle = isEditMode ? 'Editar registro' : 'Nuevo registro';
  const subtitle = isGasto
    ? (isEditMode ? 'Edita el gasto' : 'Registra un gasto')
    : (isEditMode ? 'Edita el ingreso' : 'Registra un ingreso');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [types, cats, freqs] = await Promise.all([
          getTransactionTypes(),
          getTransactionCategories(),
          getTransactionFrequencies(),
        ]);

        console.log('[NewTransaction] types:', JSON.stringify(types));
        console.log('[NewTransaction] freqs:', JSON.stringify(freqs));
        console.log('[NewTransaction] cats:', JSON.stringify(cats));

        const gastoType = types.find(t => {
          const n = t.name.toLowerCase();
          return n === 'gasto' || n === 'egreso' || n === 'expense' || n.includes('gasto');
        });
        const ingresoType = types.find(t => {
          const n = t.name.toLowerCase();
          return n === 'ingreso' || n === 'income' || n.includes('ingreso');
        });

        if (gastoType) setGastoTypeId(gastoType.id || gastoType.transaction_type_id || '');
        if (ingresoType) setIngresoTypeId(ingresoType.id || ingresoType.transaction_type_id || '');

        if (!gastoType || !ingresoType) {
          console.warn('[NewTransaction] No se encontraron tipos. Tipos recibidos:', types.map(t => t.name));
        }

        const onceFreq = freqs.find(f =>
          f.name.toLowerCase().includes('única') ||
          f.name.toLowerCase().includes('unica') ||
          f.name.toLowerCase().includes('vez') ||
          f.name.toLowerCase().includes('once') ||
          f.name.toLowerCase().includes('única')
        ) || freqs[0];
        const monthlyFreq = freqs.find(f =>
          f.name.toLowerCase().includes('mensual') ||
          f.name.toLowerCase().includes('monthly')
        );
        if (onceFreq) setOnceFreqId(onceFreq.id ?? onceFreq.transaction_frequency_id ?? '');
        if (monthlyFreq) setMonthlyFreqId(monthlyFreq.id ?? monthlyFreq.transaction_frequency_id ?? '');

        const map: Record<string, string> = {};
        const nameMap: Record<string, string> = {};
        cats.forEach(c => {
          const catId = c.id ?? c.transaction_category_id ?? '';
          if (catId) {
            map[c.name.toLowerCase()] = catId;
            nameMap[catId] = c.name;
          }
        });
        setCategoryUUIDs(map);
        setCategoryNames(nameMap);
      } catch (e: any) {
        console.error('[NewTransaction] Error cargando datos:', e?.response?.data ?? e?.message ?? e);
        setLoadError('No se pudieron cargar los datos del formulario. Verifica tu conexión.');
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isEditMode || isLoadingData) return;
    const loadEditData = async () => {
      try {
        const { default: apiClient } = await import('@/services/api/apiClient');
        const res = await apiClient.get(`/transactions/individual/${editId}`);
        const tx = res.data;
        console.log('[EditMode] raw tx:', JSON.stringify(tx));

        const txAmount = Math.abs(parseFloat(tx.amount || tx.transaction_amount || 0));
        setAmount(String(Math.round(txAmount)));

        if (tx.description) setDescription(tx.description);

        const typeName = (tx.transaction_type?.name || tx.type_name || '').toLowerCase();
        const isIncome = typeName.includes('ingreso') || typeName.includes('income') || tx.type === 'INCOME';
        setType(isIncome ? 'ingreso' : 'gasto');

        const catId = tx.transaction_category_id || tx.category_id;
        if (catId && categoryNames[catId]) {
          setCategory(categoryNames[catId]);
        }

        const freqId = tx.transaction_frequency_id || tx.frequency_id;
        if (freqId) {
          setFrequency(freqId === monthlyFreqId ? 'monthly' : 'once');
        }
      } catch (e: any) {
        console.warn('[EditMode] Could not load transaction:', e?.response?.data ?? e?.message);
      }
    };
    loadEditData();
  }, [isEditMode, isLoadingData, editId, categoryNames, monthlyFreqId]);

  const handleTypeChange = useCallback((newType: LocalTransactionType) => {
    setType(newType);
    setCategory('');
  }, []);

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a $0.');
      return;
    }
    const typeId = isGasto ? gastoTypeId : ingresoTypeId;
    if (!typeId) {
      setErrorMsg('No se pudo identificar el tipo de transacción.');
      return;
    }

    const skipCategoryValidation = isGroupMode && !isGasto;
    if (!skipCategoryValidation && !category) {
      setErrorMsg('Por favor, selecciona una categoría.');
      return;
    }

    const categoryId = categoryUUIDs[category.toLowerCase()];
    const frequencyId = frequency === 'monthly' ? monthlyFreqId : onceFreqId;

    const payload: any = {
      amount: parseFloat(amount),
      transaction_type_id: typeId,
      ...(categoryId ? { transaction_category_id: categoryId } : {}),
      ...(frequencyId ? { transaction_frequency_id: frequencyId } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
      transaction_date: date,
    };

    if (isGroupMode) {
      payload.is_group_transaction = true;
    }

    try {
      setIsSaving(true);
      if (isEditMode && editId) {
        await updateTransaction(editId, payload);
      } else {
        await createTransaction(payload);
      }
      router.back();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d: any) => d.msg).join('. '));
      } else {
        setErrorMsg('Error al guardar. Intenta nuevamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={APP_THEME.cards.income.text} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="cloud-offline-outline" size={48} color={APP_THEME.status.alerts.errorText} />
          <Text style={{ color: APP_THEME.status.alerts.errorText, textAlign: 'center', marginTop: 16, fontSize: 15 }}>
            {loadError}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
            <Text style={{ color: APP_THEME.cards.income.text, fontWeight: '600' }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // UI
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={APP_THEME.text.primary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>{pageTitle}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>

          {/* Toggle Gasto / Ingreso */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, isGasto && styles.toggleBtnActive]}
              onPress={() => handleTypeChange('gasto')}
            >
              <Ionicons
                name="trending-down-outline"
                size={17}
                color={isGasto ? APP_THEME.cards.expense.text : APP_THEME.text.secondary}
              />
              <Text style={[styles.toggleText, { color: isGasto ? APP_THEME.cards.expense.text : APP_THEME.text.secondary }]}>
                Gasto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, !isGasto && styles.toggleBtnActive]}
              onPress={() => handleTypeChange('ingreso')}
            >
              <Ionicons
                name="trending-up-outline"
                size={17}
                color={!isGasto ? APP_THEME.cards.income.text : APP_THEME.text.secondary}
              />
              <Text style={[styles.toggleText, { color: !isGasto ? APP_THEME.cards.income.text : APP_THEME.text.secondary }]}>
                Ingreso
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form unified */}
          <NewTransactionForm
            type={type}
            selectedCategory={category}
            onCategoryChange={setCategory}
            amount={amount}
            onAmountChange={setAmount}
            description={description}
            onDescriptionChange={setDescription}
            date={date}
            formattedDate={formatDateDisplay(date)}
            frequency={frequency}
            onFrequencyChange={setFrequency}
            isGroupMode={isGroupMode}
          />

          {/* Error */}
          {!!errorMsg && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color={APP_THEME.status.alerts.errorText} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Save */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: isGasto ? APP_THEME.status.error : APP_THEME.status.success },
              isSaving && { opacity: 0.7 }
            ]}
            onPress={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Guardar registro</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  container: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: APP_THEME.card.background,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: APP_THEME.text.secondary,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: APP_THEME.components.tabs.inactiveBg,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    backgroundColor: 'transparent',
  },
  toggleBtnActive: {
    backgroundColor: APP_THEME.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleText: {
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: APP_THEME.status.alerts.errorBg,
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: APP_THEME.status.alerts.errorText,
    fontSize: 13,
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_THEME.cards.income.text,
    borderRadius: 14,
    paddingVertical: 18,
    gap: 10,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});