import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import * as authApi from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email });
      if (res.data.success) {
        setSuccessMsg('OTP sent to your email! Check your inbox.');
        localStorage.setItem('resetEmail', email);
        setTimeout(() => navigate('/verify-otp'), 3000);
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-10">
        <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8">
          <ArrowLeft size={16} className="mr-1" /> Back to login
        </Link>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <KeyRound size={28} className="text-indigo-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
          <p className="text-slate-500 text-sm">Enter your email and we'll send you a 6-digit OTP</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">{error}</div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            {successMsg}
            <p className="text-xs text-green-500 mt-2">Redirecting to verification...</p>
          </div>
        )}

        <form onSubmit={handleSendOTP} className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
                placeholder="name@company.com" />
            </div>
          </div>

          <button type="submit" disabled={loading || successMsg}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : successMsg ? 'OTP Sent' : 'Send OTP'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
