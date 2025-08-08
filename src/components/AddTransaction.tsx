import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
}

interface Category {
  id: string;
  group_name: string;
  name: string;
}

interface AddTransactionProps {
  user: User;
  onAdded: () => void;
}

export default function AddTransaction({ user, onAdded }: AddTransactionProps) {
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'expense' | 'income' | 'lend' | 'borrow'>('expense');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [occurredAt, setOccurredAt] = useState<string>(new Date().toISOString().slice(0, 10));
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('group_name');

    if (error) {
      console.error(error);
    } else if (data) {
      setCategories(data as Category[]);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!amount || !categoryId) return alert('Please fill all required fields');

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      type,
      category_id: categoryId,
      description,
      occurred_at: occurredAt,
    });

    if (error) {
      alert(error.message);
    } else {
      setAmount('');
      setDescription('');
      onAdded();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={type} onChange={e => setType(e.target.value as typeof type)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
        <option value="lend">Lend</option>
        <option value="borrow">Borrow</option>
      </select>

      <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.group_name} - {cat.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={occurredAt}
        onChange={e => setOccurredAt(e.target.value)}
        required
      />

      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <button type="submit">Add Transaction</button>
    </form>
  );
}
