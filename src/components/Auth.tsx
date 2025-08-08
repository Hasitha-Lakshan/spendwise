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
    <div>
      <h2>Login / Sign Up</h2>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={handleEmailChange}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Loading...' : 'Send Magic Link'}
      </button>
    </div>
  );
}
