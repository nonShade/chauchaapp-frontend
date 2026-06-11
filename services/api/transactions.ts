import apiClient from './apiClient';
import {
  Transaction,
  SummaryResponse,
  IncomeExpenseData,
  DistributionData,
  TransactionType,
  TransactionCategory,
  TransactionFrequency,
  CreateTransactionPayload
} from '../../types/transaction';
import { adaptIncomeVsExpenses, adaptDistribution, adaptSummary } from './adapters';

export const getSummary = async (): Promise<SummaryResponse> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');

  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const endDate = `${year}-${month}-${lastDay}`;

  const response = await apiClient.get(`/transactions/summary?start_date=${startDate}&end_date=${endDate}`);
  return adaptSummary(response.data || {});
};

export const getTransactionsHistory = async (): Promise<Transaction[]> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const endDate = `${year}-${month}-${lastDay}`;
  const response = await apiClient.get(`/transactions/individual?limit=100&end_date=${endDate}`);
  return response.data;
};

export const getIncomeVsExpenses = async (): Promise<IncomeExpenseData> => {
  const timestamp = new Date().getTime();
  const response = await apiClient.get(`/transactions/analytics/income-vs-expenses?t=${timestamp}`);
  return adaptIncomeVsExpenses(response.data || []);
};

export const getDistribution = async (): Promise<DistributionData[]> => {
  const response = await apiClient.get('/transactions/analytics/distribution');
  return adaptDistribution(response.data || []);
};

export const getGroupSummary = async (): Promise<SummaryResponse> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');

  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const endDate = `${year}-${month}-${lastDay}`;

  const response = await apiClient.get(`/transactions/family-group/summary?start_date=${startDate}&end_date=${endDate}`);
  return adaptSummary(response.data || {});
};

export const getGroupTransactionsHistory = async (): Promise<Transaction[]> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const endDate = `${year}-${month}-${lastDay}`;
  const response = await apiClient.get(`/transactions/family-group?limit=100&end_date=${endDate}`);
  return response.data;
};

export const getGroupDistribution = async (): Promise<DistributionData[]> => {
  const response = await apiClient.get('/transactions/family-group/analytics/distribution');
  return adaptDistribution(response.data || []);
};

export const getGroupIncomeVsExpenses = async (): Promise<IncomeExpenseData> => {
  const timestamp = new Date().getTime();
  const response = await apiClient.get(`/transactions/family-group/analytics/income-vs-expenses?t=${timestamp}`);
  return adaptIncomeVsExpenses(response.data || []);
};

export const createTransaction = async (data: CreateTransactionPayload): Promise<Transaction> => {
  const response = await apiClient.post('/transactions', data);
  return response.data;
};

export const getTransactionTypes = async (): Promise<TransactionType[]> => {
  const response = await apiClient.get('/transactions/types');
  return response.data;
};

export const getTransactionCategories = async (): Promise<TransactionCategory[]> => {
  const response = await apiClient.get('/transactions/categories');
  return response.data;
};

export const getTransactionFrequencies = async (): Promise<TransactionFrequency[]> => {
  const response = await apiClient.get('/transactions/frequencies');
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
