import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import { jwtDecode } from 'jwt-decode';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        dispatch(setCredentials({ user: decoded.user, token }));
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to decode token:', error);
        navigate('/login', { state: { error: 'Authentication failed. Please try again.' } });
      }
    } else {
      navigate('/login');
    }
  }, [location, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="font-black text-gray-900 text-xl uppercase tracking-tight">Authenticating...</h2>
      <p className="text-gray-500 text-sm mt-2">Connecting your account...</p>
    </div>
  );
};

export default AuthCallback;
