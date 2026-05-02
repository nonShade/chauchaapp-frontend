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

      let balanceAcc = 0;
      let incomeAcc = 0;
      let expenseAcc = 0;
      const categoriesMap: Record<string, number> = {};

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
            let catName = tx.transaction_type?.name || tx.type_name || tx.category_name || tx.category;
            if (!catName || catName.trim() === '') {
              const desc = tx.description || 'Otros';
              catName = desc.charAt(0).toUpperCase() + desc.slice(1).toLowerCase();
            }
            categoriesMap[catName] = (categoriesMap[catName] || 0) + normalized.amount;
          }
        } catch (e) { }
      });

      // Convertir el mapa de categorías a la estructura de distribución
      const localDistribution = Object.keys(categoriesMap).map(category => ({
        category,
        amount: categoriesMap[category],
        percentage: expenseAcc > 0 ? Math.round((categoriesMap[category] / expenseAcc) * 100) : 0
      }));

      setSummary(summaryData);
      setTransactions(transactionsData);
      setCalculatedBalance(balanceAcc);
      setCalculatedIncome(incomeAcc);
      setCalculatedExpense(expenseAcc);
      setIncomeVsExpenses(incomeVsExpensesData);
      setDistribution(localDistribution.length > 0 ? localDistribution : distributionData);
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
