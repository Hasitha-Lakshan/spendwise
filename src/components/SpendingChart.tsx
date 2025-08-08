import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';

interface Transaction {
  amount: number | string;
  type: 'income' | 'expense' | string;
  occurred_at: string;
}

interface SpendingChartProps {
  transactions: Transaction[];
}

export default function SpendingChart({ transactions }: SpendingChartProps) {
  // Aggregate expenses and incomes by month
  const dataByMonth: Record<
    string,
    { income: number; expense: number }
  > = {};

  transactions.forEach(tx => {
    const month = dayjs(tx.occurred_at).format('YYYY-MM');
    if (!dataByMonth[month]) dataByMonth[month] = { income: 0, expense: 0 };
    // Ensure tx.type is either income or expense before adding
    if (tx.type === 'income' || tx.type === 'expense') {
      dataByMonth[month][tx.type] += typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    }
  });

  const labels = Object.keys(dataByMonth).sort();
  const incomeData = labels.map(m => dataByMonth[m].income || 0);
  const expenseData = labels.map(m => dataByMonth[m].expense || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        backgroundColor: 'rgba(75,192,192,0.6)',
        data: incomeData,
      },
      {
        label: 'Expense',
        backgroundColor: 'rgba(255,99,132,0.6)',
        data: expenseData,
      },
    ],
  };

  return <Bar data={data} />;
}
