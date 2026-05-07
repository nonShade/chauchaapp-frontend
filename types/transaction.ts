export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  date: string;
}

export interface SummaryResponse {
  total_income: number;
  total_expenses: number;
  total_balance: number;
  period_income?: number;
  period_expenses?: number;
  period_balance?: number;
}

export interface IncomeExpenseData {
  labels: string[];
  income: number[];
  expense: number[];
}

export interface DistributionData {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface TransactionType {
  id?: string;
  transaction_type_id?: string;
  name: string;
}

export interface TransactionCategory {
  id?: string;
  transaction_category_id?: string;
  name: string;
  transaction_type_id?: string;
}

export interface TransactionFrequency {
  id?: string;
  transaction_frequency_id?: string;
  name: string;
}

export interface CreateTransactionPayload {
  amount: number;
  transaction_type_id: string;
  transaction_category_id?: string;
  transaction_frequency_id?: string;
  description?: string;
  transaction_date: string;
}

export type LocalTransactionType = 'gasto' | 'ingreso';
export type LocalFrequency = 'once' | 'monthly';

export interface TransactionFormData {
  type: LocalTransactionType;
  amount: string;
  category: string;
  description: string;
  date: string;
  frequency: LocalFrequency;
}

