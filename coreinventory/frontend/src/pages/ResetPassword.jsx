import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import * as authApi from '../api/auth';

const getStrength = (pw) => {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9!@#$%^&*]/.test(pw)) s++;
  return s;
};

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPw) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      const resetToken = localStorage.getItem('resetToken');
      const res = await authApi.resetPassword({ resetToken, newPassword: password });
      if (res.data.success) {
        setSuccess(true);
        localStorage.removeItem('resetToken');
        localStorage.removeItem('resetEmail');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(res.data.message || 'Failed to reset');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Password Reset!</h2>
          <p className="text-slate-500 text-sm">Your password has been changed. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <Lock size={28} className="text-indigo-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Your Password</h1>
          <p className="text-slate-500 text-sm">Choose a strong new password</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full h-10 pl-10 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                placeholder="Enter new password" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength bar */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-slate-200'}`} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-orange-500' : strength <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {strengthLabels[strength]}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showConfirm ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required
                className="w-full h-10 pl-10 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                placeholder="Confirm new password" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
