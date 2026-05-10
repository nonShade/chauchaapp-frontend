import { useState, useEffect, useCallback } from 'react';
import {
  getSummary,
  getTransactionsHistory,
  getIncomeVsExpenses,
  getDistribution,
  getTransactionCategories,
  getTransactionTypes
} from '../services/api/transactions';
import {
  SummaryResponse,
  Transaction,
  IncomeExpenseData,
  DistributionData
} from '../types/transaction';
import { APP_THEME } from '../constants/themes';

const OFFICIAL_CATEGORIES = [
  'Vivienda', 'Alimentación', 'Transporte', 'Servicios',
  'Salud', 'Entretenimiento', 'Educación', 'Vestuario',
  'Créditos', 'Ahorro', 'Otros',
  'Sueldo', 'Freelance', 'Bonificacion', 'Inversiones'
];

function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function normalizeToOfficialCategory(tx: any, categoryMap: Record<string, string> = {}): string {
  const catId = tx.transaction_category_id || tx.category_id || '';
  let catName = categoryMap[catId] || '';

  if (!catName) {
    catName = tx.transaction_category?.name || tx.category_name || tx.category?.name || tx.category || '';
  }

  if (!catName) return 'Otros';

  const normalizedInput = removeAccents(catName);

  const found = OFFICIAL_CATEGORIES.find(c => {
    const normalizedOfficial = removeAccents(c);
    return normalizedInput === normalizedOfficial ||
      normalizedInput.includes(normalizedOfficial) ||
      normalizedOfficial.includes(normalizedInput);
  });

  return found || 'Otros';
}

function buildDistributionFromTransactions(txList: any[], totalExpense: number, catLookup: Record<string, string>, typeLookup: Record<string, 'INCOME' | 'EXPENSE'>): DistributionData[] {
  const categorySummaryMap: Record<string, { name: string; amount: number }> = {};

  txList.forEach((tx: any) => {
    try {
      const { normalizeTransaction } = require('../services/api/adapters');
      const normalized = normalizeTransaction(tx, typeLookup);

      if (normalized.type !== 'EXPENSE') return;

      const catName = normalizeToOfficialCategory(tx, catLookup);

      if (!categorySummaryMap[catName]) {
        categorySummaryMap[catName] = { name: catName, amount: 0 };
      }
      categorySummaryMap[catName].amount += normalized.amount;
    } catch (_) { }
  });

  const colors = APP_THEME.cards.categories;
  return Object.values(categorySummaryMap)
    .sort((a, b) => b.amount - a.amount)
    .map((cat, idx) => ({
      category: cat.name,
      amount: cat.amount,
      percentage: totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0,
      color: colors[idx % colors.length],
    }));
}

export function useCartolaData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [calculatedBalance, setCalculatedBalance] = useState<number>(0);
  const [calculatedIncome, setCalculatedIncome] = useState<number>(0);
  const [calculatedExpense, setCalculatedExpense] = useState<number>(0);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<IncomeExpenseData | null>(null);
  const [distribution, setDistribution] = useState<DistributionData[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        summaryData,
        transactionsData,
        incomeVsExpensesData,
        distributionData,
        categoriesData,
        typesData
      ] = await Promise.all([
        getSummary(),
        getTransactionsHistory(),
        getIncomeVsExpenses(),
        getDistribution(),
        getTransactionCategories(),
        getTransactionTypes()
      ]);

      const typeLookup: Record<string, 'INCOME' | 'EXPENSE'> = {};
      if (Array.isArray(typesData)) {
        typesData.forEach((t: any) => {
          const id = t.id || t.transaction_type_id;
          const name = (t.name || '').toLowerCase();
          if (id) {
            if (name.includes('ingreso') || name.includes('income')) {
              typeLookup[id] = 'INCOME';
            } else {
              typeLookup[id] = 'EXPENSE';
            }
          }
        });
      }

      const catLookup: Record<string, string> = {};
      if (Array.isArray(categoriesData)) {
        categoriesData.forEach((c: any) => {
          const id = c.id || c.transaction_category_id;
          if (id) catLookup[id] = c.name;
        });
      }

      const txList = Array.isArray(transactionsData)
        ? transactionsData
        : (transactionsData as any)?.data || [];

      let balanceAcc = 0;
      let incomeAcc = 0;
      let expenseAcc = 0;

      const { normalizeTransaction } = require('../services/api/adapters');

      const normalizedTransactions = txList.map((tx: any) => {
        const normalized = normalizeTransaction(tx, typeLookup);

        normalized.category = normalizeToOfficialCategory(tx, catLookup);

        if (normalized.type === 'INCOME') {
          balanceAcc += normalized.amount;
          incomeAcc += normalized.amount;
        } else {
          balanceAcc -= normalized.amount;
          expenseAcc += normalized.amount;
        }
        return normalized;
      });

      const finalDistribution = buildDistributionFromTransactions(txList, expenseAcc, catLookup, typeLookup);

      // Calcular income vs expenses de forma local hasta resolver 
      const monthlyDataMap: Record<string, { income: number, expenses: number }> = {};
      normalizedTransactions.forEach((tx: any) => {
        const date = new Date(tx.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyDataMap[key]) monthlyDataMap[key] = { income: 0, expenses: 0 };
        if (tx.type === 'INCOME') {
          monthlyDataMap[key].income += tx.amount;
        } else {
          monthlyDataMap[key].expenses += tx.amount;
        }
      });
      const localRawData = Object.entries(monthlyDataMap).map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses
      }));
      const { adaptIncomeVsExpenses } = require('../services/api/adapters');
      const localIncomeVsExpensesData = adaptIncomeVsExpenses(localRawData);

      setSummary(summaryData);
      setTransactions(normalizedTransactions);
      setCalculatedBalance(balanceAcc);
      setCalculatedIncome(incomeAcc);
      setCalculatedExpense(expenseAcc);
      setIncomeVsExpenses(localIncomeVsExpensesData);
      setDistribution(finalDistribution);
    } catch (err: any) {
      console.error('Error fetching cartola data:', err);
      setError(err.message || 'Error al cargar los datos de la cartola.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    error,
    summary,
    transactions,
    calculatedBalance,
    calculatedIncome,
    calculatedExpense,
    incomeVsExpenses,
    distribution,
    refetch: fetchData
  };
}