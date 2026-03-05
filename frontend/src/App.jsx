import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import JobPost from './pages/JobPost';
import JobListing from './pages/JobListing';
import JobDetails from './pages/JobDetails';
import Chat from './pages/Chat';
import Checkout from './pages/Checkout';
import Pricing from './pages/Pricing';
import SellerProfile from './pages/SellerProfile';
import AdminDashboard from './pages/AdminDashboard';
import SellerOnboarding from './pages/SellerOnboarding';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import MyBids from './pages/MyBids';
import TermsOfService from './pages/TermsOfService';
import useSocket from './hooks/useSocket';

// Protected Route
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Admin-only Route
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

// Home redirects to dashboard if logged in
const HomeRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />;
};

// Inner app that uses hooks (must be inside Router/Provider)
function AppInner() {
  // Wire up Socket.IO — registers user and listens for notifications globally
  useSocket();

  return (
    <>
      {/* Global Neo-Brutalist Grid Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[-1]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 0,transparent 50%),repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 0,transparent 50%)', backgroundSize: '40px 40px' }} />

      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobListing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/seller/:id" element={<SellerProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Protected */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
        <Route path="/my-bids" element={<PrivateRoute><MyBids /></PrivateRoute>} />
        <Route path="/post-job" element={<PrivateRoute><JobPost /></PrivateRoute>} />
        <Route path="/jobs/:id" element={<PrivateRoute><JobDetails /></PrivateRoute>} />
        <Route path="/chat/:jobId" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/checkout/:txId" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/seller-onboarding" element={<PrivateRoute><SellerOnboarding /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
