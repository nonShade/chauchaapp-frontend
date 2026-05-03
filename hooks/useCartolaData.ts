import { useState, useEffect, useCallback } from 'react';
import {
  getSummary,
  getTransactionsHistory,
  getIncomeVsExpenses,
  getDistribution
} from '../services/api/transactions';
import {
  SummaryResponse,
  Transaction,
  IncomeExpenseData,
  DistributionData
} from '../types/transaction';
import { APP_THEME } from '../constants/themes';

//Helpers para el fallback local

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

function cleanCategoryName(description: string): string {
  let clean = description.toLowerCase();
  MONTHS.forEach(m => { clean = clean.replace(m, '').trim(); });
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function buildDistributionFromTransactions(txList: any[], totalExpense: number): DistributionData[] {
  const categoryMap: Record<string, { name: string; amount: number }> = {};

  txList.forEach((tx: any) => {
    try {
      const { normalizeTransaction } = require('../services/api/adapters');
      const normalized = normalizeTransaction(tx);
      if (normalized.type !== 'EXPENSE') return;

      const catId = tx.transaction_category_id || tx.transaction_type_id || 'sin-categoria';

      const catName =
        tx.transaction_category?.name ||
        tx.category_name ||
        cleanCategoryName(tx.description || 'Otros');

      if (!categoryMap[catId]) {
        categoryMap[catId] = { name: catName, amount: 0 };
      }
      categoryMap[catId].amount += normalized.amount;
    } catch (_) { }
  });

  const colors = APP_THEME.cards.categories;
  return Object.values(categoryMap)
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
        distributionData
      ] = await Promise.all([
        getSummary(),
        getTransactionsHistory(),
        getIncomeVsExpenses(),
        getDistribution()
      ]);

      const txList = Array.isArray(transactionsData)
        ? transactionsData
        : (transactionsData as any)?.data || [];

      console.log('[DEBUG] Raw txList length:', txList.length);

      let balanceAcc = 0;
      let incomeAcc = 0;
      let expenseAcc = 0;
      const localCategories = new Set();

      txList.forEach((tx: any) => {
        try {
          const { normalizeTransaction } = require('../services/api/adapters');
          const normalized = normalizeTransaction(tx);
          if (normalized.type === 'INCOME') {
            balanceAcc += normalized.amount;
            incomeAcc += normalized.amount;
          } else {
            balanceAcc -= normalized.amount;
            expenseAcc += normalized.amount;

            const catId = tx.transaction_category_id || tx.transaction_type_id || 'sin-id';
            localCategories.add(catId);
          }
        } catch (_) { }
      });

      const apiDistribution = Array.isArray(distributionData) ? distributionData : [];

      const useLocalFallback = apiDistribution.length <= 1 && localCategories.size > apiDistribution.length;

      console.log(`[DEBUG] API Categories: ${apiDistribution.length}, Local Categories detected: ${localCategories.size}`);

      const finalDistribution = useLocalFallback
        ? buildDistributionFromTransactions(txList, expenseAcc)
        : apiDistribution;

      console.log('[DEBUG] finalDistribution:', JSON.stringify(finalDistribution));

      setSummary(summaryData);
      setTransactions(transactionsData);
      setCalculatedBalance(balanceAcc);
      setCalculatedIncome(incomeAcc);
      setCalculatedExpense(expenseAcc);
      setIncomeVsExpenses(incomeVsExpensesData);
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
