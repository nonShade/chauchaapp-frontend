import { Transaction, IncomeExpenseData, DistributionData } from '../../types/transaction';
import { APP_THEME } from '../../constants/themes';

const MONTH_NAMES: Record<string, string> = {
  '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
  '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
  '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
};

const MONTH_NAMES_SHORT: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

export const adaptIncomeVsExpenses = (raw: any[]): IncomeExpenseData => {
  return {
    labels: raw.map(item => {
      const monthNum = item.month?.split('-')[1] || '';
      return MONTH_NAMES_SHORT[monthNum] || item.month;
    }),
    income: raw.map(item => parseFloat(item.income) || 0),
    expense: raw.map(item => parseFloat(item.expenses) || 0),
  };
};

export const adaptDistribution = (raw: any[]): DistributionData[] => {
  const colors = APP_THEME.cards.categories;

  return raw.map((item, index) => ({
    category: item.category_name || 'Sin categoría',
    amount: parseFloat(item.total_amount) || 0,
    percentage: item.percentage || 0,
    color: colors[index % colors.length],
  }));
};

export const normalizeTransaction = (t: any): Transaction => {
  const dateStr = t.transaction_date || t.date || new Date().toISOString();
  const date = new Date(dateStr);
  const validDate = isNaN(date.getTime()) ? new Date() : date;

  const amount = Math.abs(parseFloat(t.amount)) || 0;
  const description = (t.description || '').toLowerCase();

  const typeName = (t.transaction_type?.name || t.type_name || t.category || '').toLowerCase();

  const isIncome =
    typeName.includes('ingreso') ||
    t.type === 'INCOME' ||
    description.includes('sueldo') ||
    description.includes('abono');

  return {
    ...t,
    id: t.transaction_id || t.id || Math.random().toString(),
    amount: amount,
    date: dateStr,
    type: isIncome ? 'INCOME' : 'EXPENSE',
    description: t.description || 'Sin descripción'
  } as Transaction;
};

export interface GroupedMonth {
  id: string;
  name: string;
  amount: number;
  isPositive: boolean;
  details: {
    incomeAmount: number;
    expenseAmount: number;
    incomes: Transaction[];
    expenses: Transaction[];
  }
}

export const groupTransactionsByMonth = (transactions: any[]): GroupedMonth[] => {
  const groups: Record<string, GroupedMonth> = {};
  const rawList = Array.isArray(transactions) ? transactions : (transactions as any)?.data || [];

  if (rawList.length === 0) return [];
  const sortedList = [...rawList].sort((a, b) => {
    const dateA = new Date(a.transaction_date || a.date).getTime();
    const dateB = new Date(b.transaction_date || b.date).getTime();
    return dateB - dateA;
  });

  sortedList.forEach((t: any) => {
    try {
      const normalized = normalizeTransaction(t);
      const date = new Date(normalized.date);

      const monthNum = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const key = `${year}-${monthNum}`;
      const monthName = `${MONTH_NAMES[monthNum] || 'Mes'} ${year}`;

      if (!groups[key]) {
        groups[key] = {
          id: key,
          name: monthName,
          amount: 0,
          isPositive: true,
          details: { incomeAmount: 0, expenseAmount: 0, incomes: [], expenses: [] }
        };
      }

      if (normalized.type === 'INCOME') {
        groups[key].details.incomes.push(normalized);
        groups[key].details.incomeAmount += normalized.amount;
        groups[key].amount += normalized.amount;
      } else {
        groups[key].details.expenses.push(normalized);
        groups[key].details.expenseAmount += normalized.amount;
        groups[key].amount -= normalized.amount;
      }
    } catch (e) {
      console.error('Error procesando transaccion:', e);
    }
  });

  return Object.values(groups)
    .sort((a, b) => b.id.localeCompare(a.id))
    .map(g => ({ ...g, isPositive: g.amount >= 0 }));
};