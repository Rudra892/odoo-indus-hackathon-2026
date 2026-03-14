import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Box, Check, Loader2, UserCircle, Shield } from 'lucide-react';

const features = [
  'Real-time stock tracking',
  'Multi-warehouse support',
  'Smart low stock alerts',
  'Complete movement history',
];

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [role, setRole] = useState('Inventory Manager');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPw) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await registerUser(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
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
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Box size={28} className="text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">CoreInventory</span>
          </div>

          <h2 className="text-[28px] font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-sm text-slate-500 mb-8">Join CoreInventory today</p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <UserCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                  placeholder="Enter your full name" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                  placeholder="Enter your email" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full h-10 pl-10 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                  placeholder="Create a password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showConfirm ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required
                  className="w-full h-10 pl-10 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                  placeholder="Confirm your password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Role</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={role} onChange={e => setRole(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all appearance-none bg-white">
                  <option>Inventory Manager</option>
                  <option>Warehouse Staff</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
