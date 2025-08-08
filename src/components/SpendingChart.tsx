import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Transaction {
  amount: number | string;
  occurred_at: string;
}

interface SpendingChartProps {
  transactions: Transaction[];
}

export default function SpendingChart({ transactions }: SpendingChartProps) {
  const dataByMonth: Record<string, { income: number; expense: number }> = {};

  transactions.forEach(tx => {
    const month = dayjs(tx.occurred_at).format('YYYY-MM');
    if (!dataByMonth[month]) dataByMonth[month] = { income: 0, expense: 0 };

    const amt = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;

    if (amt >= 0) {
      dataByMonth[month].income += amt;
    } else {
      dataByMonth[month].expense += Math.abs(amt);
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

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-md shadow-md">
      <Bar data={data} />
    </div>
  );
}
