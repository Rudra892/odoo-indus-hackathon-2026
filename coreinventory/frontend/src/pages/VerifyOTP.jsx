import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import * as authApi from '../api/auth';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const email = localStorage.getItem('resetEmail') || '';

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter all 6 digits'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, otp: code });
      if (res.data.success) {
        localStorage.setItem('resetToken', res.data.resetToken);
        navigate('/reset-password');
      } else {
        setError(res.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.forgotPassword({ email });
      setTimeLeft(600);
      setOtp(Array(6).fill(''));
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <ShieldCheck size={28} className="text-indigo-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Enter Verification Code</h1>
          <p className="text-slate-500 text-sm">We sent a 6-digit code to <br /><span className="font-semibold text-slate-700">{email}</span></p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">{error}</div>
        )}

        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-2xl font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
              />
            ))}
          </div>

          <p className="text-center text-sm mb-6">
            <span className="text-slate-500">Code expires in </span>
            <span className={`font-mono font-semibold ${timeLeft < 60 ? 'text-red-500' : 'text-indigo-600'}`}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </p>

          <button type="submit" disabled={loading || otp.join('').length !== 6}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Verify Code'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Didn't receive code?{' '}
          <button onClick={handleResend} disabled={timeLeft > 0}
            className={`font-medium ${timeLeft > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700 cursor-pointer'}`}>
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
}
