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
    else {
      setSubCategories([]);
      setSubCategoryId('');
    }
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
    if (!amount || !categoryId || !subCategoryId || !occurredAt) {
      alert('Please fill all required fields');
      return;
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      category_id: categoryId,
      sub_category_id: subCategoryId,
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
      onAdded();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 bg-white rounded-md shadow-md space-y-6"
    >
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm
            focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
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
      </div>

      <div>
        <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1">
          Sub-Category <span className="text-red-500">*</span>
        </label>
        <select
          id="subCategory"
          className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm
            focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-50"
          value={subCategoryId}
          onChange={e => setSubCategoryId(e.target.value)}
          required
          disabled={!categoryId || subCategories.length === 0}
        >
          <option value="">Select Sub-Category</option>
          {subCategories.map(sub => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="occurredAt" className="block text-sm font-medium text-gray-700 mb-1">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="occurredAt"
          type="date"
          className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm
            focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
          value={occurredAt}
          onChange={e => setOccurredAt(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm
            focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          id="description"
          type="text"
          placeholder="Description"
          className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm
            focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
          transition"
      >
        Add Transaction
      </button>
    </form>
  );
}
