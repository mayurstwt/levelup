import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'buyer',
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);


  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleChange = (role) => setFormData({ ...formData, role });

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
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
        <div className="bg-white border-2 border-gray-900 rounded shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]">
          {/* Card Header */}
          <div className="border-b-2 border-gray-900 px-8 py-6">
            <h1 className="font-black text-gray-900 text-2xl uppercase tracking-tight">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the ultimate non-RMG gaming marketplace</p>
          </div>

          {/* Card Body */}
          <div className="px-8 py-6">

            <form onSubmit={onSubmit} className="space-y-4">

              {/* Role Toggle */}
              <div className="mb-2">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  I want to...
                </label>
                <div className="grid grid-cols-2 gap-0 border-2 border-gray-900 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('buyer')}
                    className={`py-3 text-sm font-black uppercase tracking-wide transition-colors flex flex-col items-center gap-1
                      ${formData.role === 'buyer'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="text-lg">🎮</span>
                    I want to hire
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('seller')}
                    className={`py-3 text-sm font-black uppercase tracking-wide transition-colors flex flex-col items-center gap-1 border-l-2 border-gray-900
                      ${formData.role === 'seller'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="text-lg">⚡</span>
                    I want to work
                  </button>
                </div>
                {/* Role description */}
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  {formData.role === 'buyer'
                    ? 'Post jobs and hire pro gamers to level up your account.'
                    : 'Earn money by completing leveling jobs for buyers.'}
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  required
                  autoFocus
                  autoComplete="name"
                  placeholder="Your display name"
                  className="w-full border-2 border-gray-300 focus:border-blue-600 rounded px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder-gray-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  required
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
                    value={formData.password}
                    onChange={onChange}
                    required
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
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

              {/* Terms */}
              <p className="text-xs text-gray-400 leading-relaxed">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-blue-600 hover:underline font-semibold">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline font-semibold">Privacy Policy</Link>.
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-3 rounded text-sm uppercase tracking-wide transition-colors mt-1 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : 'Sign Up'}
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="border-t-2 border-gray-100 px-8 py-4 text-center bg-gray-50 rounded-b">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-black hover:underline no-underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {['🎮 50K+ Gamers', '⭐ 4.9 Rating', '🔒 Safe & Secure'].map(b => (
            <span key={b} className="text-xs text-gray-400 font-semibold">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Register;