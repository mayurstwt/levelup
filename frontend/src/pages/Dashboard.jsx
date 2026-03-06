import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { getUserJobs } from '../features/jobs/jobSlice';
import { setCredentials } from '../features/auth/authSlice';
import BuyerDashboard from './dashboards/BuyerDashboard';
import SellerDashboard from './dashboards/SellerDashboard';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserJobs());

    // Handle Discord OAuth token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      window.history.replaceState({}, document.title, '/dashboard');
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(userData => { dispatch(setCredentials({ token, user: userData })); })
        .catch(err => console.error('OAuth profile fetch failed', err));
    }
  }, [dispatch]);

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'seller') {
    return <SellerDashboard />;
  }

  // Default to Buyer Dashboard for buyers
  return <BuyerDashboard />;
};

export default Dashboard;
