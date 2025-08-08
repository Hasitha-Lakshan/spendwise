import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import AddTransaction from './AddTransaction';
import TransactionList from './TransactionList';


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
  type: string;
  category_id: string;
  sub_category_id: string | null;
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
    // Join categories and sub_categories to transactions
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

  return (
    <div>
      <h1>SpendWise Dashboard</h1>
      <AddTransaction user={user} onAdded={fetchTransactions} />
      <TransactionList transactions={transactions} />
      {/* Add analytics charts here later */}
    </div>
  );
}
