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
