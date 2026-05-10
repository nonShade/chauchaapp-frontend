import { Transaction, IncomeExpenseData, DistributionData, SummaryResponse } from '../../types/transaction';
import { APP_THEME } from '../../constants/themes';

export const adaptSummary = (raw: any): SummaryResponse => {
  return {
    total_balance: parseFloat(raw.total_balance) || 0,
    total_income: parseFloat(raw.total_income) || 0,
    total_expenses: parseFloat(raw.total_expenses) || 0,
    period_income: raw.period_income !== undefined ? parseFloat(raw.period_income) : undefined,
    period_expenses: raw.period_expenses !== undefined ? parseFloat(raw.period_expenses) : undefined,
    period_balance: raw.period_balance !== undefined ? parseFloat(raw.period_balance) : undefined,
  };
};

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
  const dataMap: Record<string, { income: number; expense: number }> = {};
  raw.forEach(item => {
    const key = item.month;
    if (key) {
      dataMap[key] = {
        income: parseFloat(item.income) || 0,
        expense: parseFloat(item.expenses) || 0,
      };
    }
  });

  const keys = Object.keys(dataMap).sort();
  if (keys.length === 0) {
    return { labels: [], income: [], expense: [] };
  }

  const firstKey = keys[0];
  const now = new Date();
  const lastKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const result: { key: string; label: string; income: number; expense: number }[] = [];
  const [startYear, startMonth] = firstKey.split('-').map(Number);
  const [endYear, endMonth] = lastKey.split('-').map(Number);

  let y = startYear;
  let m = startMonth;

  while (y < endYear || (y === endYear && m <= endMonth)) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    const monthNum = String(m).padStart(2, '0');
    const label = MONTH_NAMES_SHORT[monthNum] || key;
    const entry = dataMap[key] ?? { income: 0, expense: 0 };
    result.push({ key, label, income: entry.income, expense: entry.expense });

    m++;
    if (m > 12) { m = 1; y++; }
  }

  return {
    labels: result.map(r => r.label),
    income: result.map(r => r.income),
    expense: result.map(r => r.expense),
  };
};

export const adaptDistribution = (raw: any): DistributionData[] => {
  const items: any[] = Array.isArray(raw) ? raw : (raw?.data || []);
  const colors = APP_THEME.cards.categories;

  return items.map((item: any, index: number) => ({
    category: item.category_name || 'Sin categoría',
    amount: parseFloat(item.total_amount) || 0,
    percentage: item.percentage || 0,
    color: colors[index % colors.length],
  }));
};

export const normalizeTransaction = (t: any, typeLookup: Record<string, 'INCOME' | 'EXPENSE'> = {}): Transaction => {
  const dateStr = t.transaction_date || t.date || new Date().toISOString();

  const amount = Math.abs(parseFloat(t.amount)) || 0;
  const description = (t.description || '').toLowerCase();

  const typeId = t.transaction_type_id || t.type_id || '';
  let finalType: 'INCOME' | 'EXPENSE' = typeLookup[typeId] || 'EXPENSE';

  if (!typeLookup[typeId]) {
    const typeName = (
      t.transaction_type?.name ||
      t.type_name ||
      (t.transaction_type && typeof t.transaction_type === 'string' ? t.transaction_type : '') ||
      t.type ||
      t.category ||
      ''
    ).toUpperCase();

    const isIncome =
      typeName.includes('INGRESO') ||
      typeName.includes('INCOME') ||
      description.includes('sueldo') ||
      description.includes('abono') ||
      description.includes('pago recibido');

    if (isIncome) finalType = 'INCOME';
  }

  return {
    ...t,
    id: t.transaction_id || t.id || Math.random().toString(),
    amount: amount,
    date: dateStr,
    type: finalType,
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