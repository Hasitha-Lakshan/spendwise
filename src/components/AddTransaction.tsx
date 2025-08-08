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
      className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-8"
      noValidate
    >
      <h2 className="text-2xl font-semibold text-gray-900 text-center">Add New Transaction</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Category */}
        <div className="flex flex-col">
          <label
            htmlFor="category"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Category <span className="text-red-600">*</span>
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
            className="h-12 rounded-md border border-gray-300 bg-white px-4 text-gray-800
              shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
              transition duration-150 ease-in-out"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Category */}
        <div className="flex flex-col">
          <label
            htmlFor="subCategory"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Sub-Category <span className="text-red-600">*</span>
          </label>
          <select
            id="subCategory"
            value={subCategoryId}
            onChange={e => setSubCategoryId(e.target.value)}
            required
            disabled={!categoryId || subCategories.length === 0}
            className={`h-12 rounded-md border border-gray-300 bg-white px-4 text-gray-800
              shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
              transition duration-150 ease-in-out
              ${!categoryId || subCategories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
          >
            <option value="">Select Sub-Category</option>
            {subCategories.map(sub => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="flex flex-col">
          <label
            htmlFor="occurredAt"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Date <span className="text-red-600">*</span>
          </label>
          <input
            id="occurredAt"
            type="date"
            value={occurredAt}
            onChange={e => setOccurredAt(e.target.value)}
            required
            className="h-12 rounded-md border border-gray-300 bg-white px-4 text-gray-800
              shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
              transition duration-150 ease-in-out"
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col">
          <label
            htmlFor="amount"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Amount <span className="text-red-600">*</span>
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            className="h-12 rounded-md border border-gray-300 bg-white px-4 text-gray-800
              shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
              transition duration-150 ease-in-out"
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <label
          htmlFor="description"
          className="mb-2 text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <input
          id="description"
          type="text"
          placeholder="Optional details..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="h-12 rounded-md border border-gray-300 bg-white px-4 text-gray-800
            shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
            transition duration-150 ease-in-out"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 text-white font-semibold bg-indigo-600 rounded-md shadow-md
          hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
          transition duration-200"
      >
        Add Transaction
      </button>
    </form>
  );
}
