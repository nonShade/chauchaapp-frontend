import apiClient from './apiClient';
import { Transaction, SummaryResponse, IncomeExpenseData, DistributionData } from '../../types/transaction';
import { adaptIncomeVsExpenses, adaptDistribution } from './adapters';

export const getSummary = async (): Promise<SummaryResponse> => {
  const response = await apiClient.get('/transactions/summary');
  return response.data;
};

export const getTransactionsHistory = async (): Promise<Transaction[]> => {
  const response = await apiClient.get('/transactions/individual?limit=100');
  return response.data;
};

export const getIncomeVsExpenses = async (): Promise<IncomeExpenseData> => {
  const response = await apiClient.get('/transactions/analytics/income-vs-expenses');
  return adaptIncomeVsExpenses(response.data || []);
};

export const getDistribution = async (): Promise<DistributionData[]> => {
  const response = await apiClient.get('/transactions/analytics/distribution');
  return adaptDistribution(response.data || []);
};

export const createTransaction = async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const response = await apiClient.post('/transactions', data);
  return response.data;
};

export const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
  const response = await apiClient.put(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/transactions/${id}`);
  return response.data;
};
