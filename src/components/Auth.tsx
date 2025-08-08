import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthProps {
  onLogin?: () => void; // Optional callback after login, if needed
}

export default function Auth({ onLogin }: AuthProps) {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for login link!');
      if (onLogin) onLogin();
    }
    setLoading(false);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-md shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 text-center">Login / Sign Up</h2>

      <input
        type="email"
        placeholder="Your email"
        className="w-full rounded-md border border-gray-300 py-2 px-4
          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
        value={email}
        onChange={handleEmailChange}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className={`w-full py-3 text-white font-semibold rounded-md
          ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
          transition`}
      >
        {loading ? 'Loading...' : 'Send Magic Link'}
      </button>
    </div>
  );
}
