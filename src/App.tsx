import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

interface User {
  id: string;
  // Add any other user fields you use
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return user ? <Dashboard user={user} /> : <Auth />;
}

export default App;
