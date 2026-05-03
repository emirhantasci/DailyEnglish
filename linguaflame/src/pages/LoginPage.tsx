import { useState } from 'react';
import { Flame, LogIn, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { login, register, storeAuth, type AuthUser } from '@/services/authApi';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

type Mode = 'login' | 'register';

export function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const { user, error: err } = await register(email, displayName, password);
        if (err || !user) {
          setError(err ?? 'Registration failed');
          return;
        }
        storeAuth(user);
        onLogin(user);
      } else {
        const { user, error: err } = await login(email, password);
        if (err || !user) {
          setError('Invalid email or password');
          return;
        }
        storeAuth(user);
        onLogin(user);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-900">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Flame className="h-16 w-16 text-brand-500 animate-flame mb-3" />
          <h1 className="text-3xl font-black bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            LinguaFlame
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Master English, one day at a time 🔥</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-surface-800 p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'login'
                ? 'bg-brand-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'register'
                ? 'bg-brand-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Display name — register only */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); setError(''); }}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-700 border border-surface-600 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {mode === 'register' && (
              <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm animate-slide-up">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : mode === 'login' ? (
              <><LogIn className="h-5 w-5" /> Sign In</>
            ) : (
              <><UserPlus className="h-5 w-5" /> Create Account</>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={switchMode} className="text-brand-400 hover:text-brand-300 underline">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
