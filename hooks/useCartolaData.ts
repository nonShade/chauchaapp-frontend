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

      setSummary(summaryData);
      setTransactions(transactionsData);
      setIncomeVsExpenses(incomeVsExpensesData);
      setDistribution(distributionData);
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
    incomeVsExpenses,
    distribution,
    refetch: fetchData
  };
}
