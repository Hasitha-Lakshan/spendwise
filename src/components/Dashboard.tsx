import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import AddTransaction from './AddTransaction';
import TransactionList from './TransactionList';
import SpendingChart from './SpendingChart';  // <-- import SpendingChart

interface User {
  id: string;
}

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category_id: string;
  sub_category_id: string;
  transaction_date: string;
  description: string | null;
  category?: Category | null;
  sub_category?: SubCategory | null;
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(id, name),
        sub_category:sub_categories(id, name)
      `)
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else if (data) {
      setTransactions(data);
    }
  }

  // Map transactions for SpendingChart with occurred_at field
  const mappedTransactions = transactions.map(tx => ({
    ...tx,
    occurred_at: tx.transaction_date,
  }));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <section className="bg-white p-6 rounded-md shadow-md">
        <AddTransaction user={user} onAdded={fetchTransactions} />
      </section>

      <section className="bg-white p-6 rounded-md shadow-md">
        {/* Pass mappedTransactions to SpendingChart */}
        <SpendingChart transactions={mappedTransactions} />
      </section>

      <section className="bg-white p-6 rounded-md shadow-md">
        <TransactionList transactions={transactions} />
      </section>
    </div>
  );
}
