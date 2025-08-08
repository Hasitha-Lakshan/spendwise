import { supabase } from '../lib/supabaseClient';

interface AuthProps {
  onLogin?: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin // After login, user comes back here
      }
    });
    if (error) alert(error.message);
    if (!error && onLogin) onLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-sm text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome</h2>
        <p className="text-gray-500">Sign in to continue</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 
            bg-white border border-gray-300 rounded-lg shadow-sm
            hover:shadow-md hover:bg-gray-100 transition-all duration-200 ease-in-out
            font-medium text-gray-700"
        >
          {/* Google Logo */}
          <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
            <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.3H272v95.2h146.9c-6.4 34.4-25.6 63.5-54.5 83v68h88c51.5-47.4 81.1-117.3 81.1-195.9z"/>
            <path fill="#34a853" d="M272 544.3c73.7 0 135.6-24.4 180.8-66.1l-88-68c-24.4 16.4-55.7 26-92.8 26-71.4 0-131.8-48.1-153.4-112.9H26.1v70.9c45.5 90.1 138.9 150.1 245.9 150.1z"/>
            <path fill="#fbbc04" d="M118.6 323.3c-10.3-30.4-10.3-63 0-93.4V159H26.1c-45.6 90.1-45.6 197 0 287.1l92.5-70.8z"/>
            <path fill="#ea4335" d="M272 107.7c39.8 0 75.4 13.7 103.5 40.6l77.6-77.6C407.6 24.1 345.7 0 272 0 165 0 71.6 60 26.1 150.1l92.5 70.9c21.6-64.8 82-113.3 153.4-113.3z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
