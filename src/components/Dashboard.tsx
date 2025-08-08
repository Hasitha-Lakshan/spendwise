import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import TransactionList from './TransactionList';
import AddTransaction from './AddTransaction';

interface User {
  id: string;
}

interface Category {
  name: string;
  group_name: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  category_id: string;
  description: string | null;
  occurred_at: string;
  category?: Category;
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
      .select(`*, category:categories(name, group_name)`)
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false });

    if (error) {
      console.error(error);
    } else if (data) {
      setTransactions(data as Transaction[]);
    }
  }

  return (
    <div>
      <h1>SpendWise Dashboard</h1>
      <AddTransaction user={user} onAdded={fetchTransactions} />
      <TransactionList transactions={transactions} />
      {/* Later add charts and budget summary */}
    </div>
  );
}
