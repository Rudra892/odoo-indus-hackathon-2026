import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Box, Check, Loader2 } from 'lucide-react';

const features = [
  'Real-time stock tracking',
  'Multi-warehouse support',
  'Smart low stock alerts',
  'Complete movement history',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/30">
            <Box size={32} className="text-white" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">CoreInventory</h1>
          <p className="text-gray-400 text-sm mb-10">Streamline your inventory operations</p>
          <div className="w-12 h-px bg-gray-600 mx-auto mb-10" />
          <div className="space-y-4 text-left max-w-xs mx-auto">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-indigo-400" />
                </div>
                <span className="text-white text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Box size={28} className="text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">CoreInventory</span>
          </div>

          <h2 className="text-[28px] font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full h-10 pl-10 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
