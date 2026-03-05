import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../features/auth/authSlice';
import toast from 'react-hot-toast';


const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const { email, password } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, error, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated) {
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin);
    }
  }, [isAuthenticated, navigate, dispatch, location]);

  // Show error via toast and trigger shake
  useEffect(() => {
    if (error) {
      toast.error(error);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [error]);


  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-sans">

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

        {/* Card */}
        <div className={`bg-white border-2 rounded shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] transition-colors ${shake ? 'animate-shake border-red-500' : 'border-gray-900'}`}>
          {/* Card Header */}
          <div className="border-b-2 border-gray-900 px-8 py-6">
            <h1 className="font-black text-gray-900 text-2xl uppercase tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Login to access your dashboard</p>
          </div>

          {/* Card Body */}
          <div className="px-8 py-6">
            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full border-2 border-gray-300 focus:border-blue-600 rounded px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder-gray-400"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full border-2 border-gray-300 focus:border-blue-600 rounded px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    title={showPassword ? "Hide Password" : "Show Password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between mb-1">
                <span />
                <Link to="/forgot-password" className="text-xs text-blue-600 font-bold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-3 rounded text-sm uppercase tracking-wide transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Discord OAuth */}
          <div className="px-8 pb-5 pt-1">
            <div className="flex items-center gap-3 mb-4">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">or</span>
              <hr className="flex-1 border-gray-200" />
            </div>
            <a
              href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/discord`}
              className="flex items-center justify-center gap-3 w-full border-2 border-[#5865F2] hover:bg-[#5865F2] text-[#5865F2] hover:text-white font-black py-2.5 rounded text-sm uppercase tracking-wide transition-colors no-underline group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.04.037.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Continue with Discord
            </a>
          </div>

          {/* Card Footer */}
          <div className="border-t-2 border-gray-100 px-8 py-4 text-center bg-gray-50 rounded-b">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-black hover:underline no-underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {['🔒 Secure Login', '⚡ Instant Access', '🛡️ Safe & Trusted'].map(b => (
            <span key={b} className="text-xs text-gray-400 font-semibold">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;