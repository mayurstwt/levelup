import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await axios.post(`${backendUrl}/auth/forgot-password`, { email });
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-sans">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 0,transparent 50%),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 0,transparent 50%)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 no-underline">
            <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">GameLevelUp</span>
          </Link>
        </div>

        <div className="bg-white border-2 border-gray-900 rounded shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]">
          <div className="border-b-2 border-gray-900 px-8 py-6">
            <h1 className="font-black text-gray-900 text-2xl uppercase tracking-tight">Forgot Password</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send you a reset link.</p>
          </div>

          <div className="px-8 py-6">
            {sent ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">📧</div>
                <p className="font-black text-gray-900 text-lg mb-2">Check Your Inbox</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We sent a password reset link to <span className="font-semibold text-gray-700">{email}</span>.
                  It expires in 1 hour.
                </p>
                <Link to="/login" className="inline-block mt-6 text-blue-600 font-black text-sm hover:underline">
                  ← Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="you@example.com"
                    className="w-full border-2 border-gray-300 focus:border-blue-600 rounded px-3 py-2.5 text-sm outline-none transition-colors placeholder-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-3 rounded text-sm uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                  ) : 'Send Reset Link'}
                </button>
                <p className="text-center text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link to="/login" className="text-blue-600 font-black hover:underline">Sign In</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
