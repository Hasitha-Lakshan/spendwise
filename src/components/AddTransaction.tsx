import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

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
  category_id: string;
}

interface AddTransactionProps {
  user: User;
  onAdded: () => void;
}

export default function AddTransaction({ user, onAdded }: AddTransactionProps) {
  const [type, setType] = useState<'expense' | 'income' | 'lend' | 'borrow'>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [subCategoryId, setSubCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [occurredAt, setOccurredAt] = useState<string>(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryId) fetchSubCategories(categoryId);
    else setSubCategories([]);
    setSubCategoryId(''); // reset subcategory selection on category change
  }, [categoryId]);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading categories:', error);
    } else if (data) {
      setCategories(data);
    }
  }

  async function fetchSubCategories(categoryId: string) {
    const { data, error } = await supabase
      .from('sub_categories')
      .select('id, name, category_id')
      .eq('user_id', user.id)
      .eq('category_id', categoryId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading sub-categories:', error);
    } else if (data) {
      setSubCategories(data);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!amount || !categoryId || !occurredAt || !type) {
      alert('Please fill all required fields');
      return;
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      type,
      category_id: categoryId,
      sub_category_id: subCategoryId || null,
      transaction_date: occurredAt,
      description: description || null,
    });

    if (error) {
      alert(`Failed to add transaction: ${error.message}`);
    } else {
      setAmount('');
      setDescription('');
      setCategoryId('');
      setSubCategoryId('');
      setOccurredAt(new Date().toISOString().slice(0, 10));
      setType('expense');
      onAdded();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Type:
        <select value={type} onChange={e => setType(e.target.value as typeof type)} required>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="lend">Lend</option>
          <option value="borrow">Borrow</option>
        </select>
      </label>

      <label>
        Category:
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Sub-Category:
        <select
          value={subCategoryId}
          onChange={e => setSubCategoryId(e.target.value)}
          disabled={!categoryId || subCategories.length === 0}
        >
          <option value="">Select Sub-Category (optional)</option>
          {subCategories.map(sub => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Date:
        <input
          type="date"
          value={occurredAt}
          onChange={e => setOccurredAt(e.target.value)}
          required
        />
      </label>

      <label>
        Amount:
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </label>

      <label>
        Description:
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </label>

      <button type="submit">Add Transaction</button>
    </form>
  );
}
