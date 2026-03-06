import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-white border-2 border-gray-900 rounded p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-black px-2 py-0.5 rounded uppercase ${color}`}>{label}</span>
    </div>
    <p className="font-black text-gray-900 text-3xl">{value ?? '—'}</p>
  </div>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, jobsRes, txRes] = await Promise.all([
          axios.get(`${backendUrl}/admin/users`, authHeader),
          axios.get(`${backendUrl}/jobs?limit=100`, authHeader),
          axios.get(`${backendUrl}/polar/transactions`, authHeader).catch(() => ({ data: [] }))
        ]);
        setUsers(usersRes.data);
        setJobs(jobsRes.data.jobs || []);
        setTransactions(txRes.data || []);
      } catch (err) {
        console.error('Admin fetch error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const resolveDispute = async (jobId, resolution) => {
    try {
      await axios.post(`${backendUrl}/admin/dispute`, { jobId, resolution }, authHeader);
      setJobs(jobs.map(j => j._id === jobId ? { ...j, status: 'completed' } : j));
    } catch (err) {
      alert(err.response?.data?.message || 'Error resolving dispute');
    }
  };

  const banUser = async (userId) => {
    try {
      const res = await axios.put(`${backendUrl}/admin/users/${userId}/ban`, {}, authHeader);
      setUsers(users.map(u => u._id === userId ? { ...u, isBanned: res.data.isBanned } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling ban state');
    }
  };

  const kycUser = async (userId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'verified' ? 'rejected' : 'verified';
      const res = await axios.put(`${backendUrl}/admin/users/${userId}/kyc`, { kycStatus: nextStatus }, authHeader);
      setUsers(users.map(u => u._id === userId ? { ...u, kycStatus: res.data.kycStatus } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating KYC');
    }
  };

  const disputes = jobs.filter(j => j.status === 'disputed');
  const openJobs = jobs.filter(j => j.status === 'open');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const sellers = users.filter(u => u.role === 'seller');
  const buyers = users.filter(u => u.role === 'buyer');

  const statusBadge = (status) => {
    const map = {
      open: 'bg-green-100 text-green-800',
      matched: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-700',
      disputed: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        label: 'Platform Revenue (◈)',
        data: [1200, 1900, 3000, 5000, 4200, 6000, 7500],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        tension: 0.4
      },
    ],
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        label: 'Active Users',
        data: [50, 120, 300, 450, 600, 800, 1200],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        tension: 0.4
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'inherit', weight: 'bold' } } },
    },
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [2, 4] } },
      x: { grid: { display: false } }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white border-b-2 border-gray-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-black text-gray-900 text-xl uppercase tracking-tight">🛡️ Admin Dashboard</h1>
            <p className="text-gray-500 text-xs">Platform management & oversight</p>
          </div>
          <span className="bg-red-100 border border-red-300 text-red-700 text-xs font-black px-3 py-1 rounded uppercase">Admin Access</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon="👥" label="Users" value={users.length} color="bg-blue-100 text-blue-700" />
          <StatCard icon="⚡" label="Sellers" value={sellers.length} color="bg-purple-100 text-purple-700" />
          <StatCard icon="🎮" label="Buyers" value={buyers.length} color="bg-indigo-100 text-indigo-700" />
          <StatCard icon="📋" label="Open Jobs" value={openJobs.length} color="bg-green-100 text-green-700" />
          <StatCard icon="⚠️" label="Disputes" value={disputes.length} color="bg-red-100 text-red-700" />
        </div>

        {/* Active Disputes Banner */}
        {disputes.length > 0 && (
          <div className="bg-red-50 border-2 border-red-400 rounded p-4 mb-6">
            <p className="font-black text-red-700 text-sm uppercase mb-3">⚠️ {disputes.length} Active Dispute{disputes.length !== 1 ? 's' : ''} Require Attention</p>
            <div className="space-y-3">
              {disputes.map(j => (
                <div key={j._id} className="flex items-center justify-between bg-white border border-red-200 rounded p-3">
                  <div>
                    <p className="font-black text-gray-900 text-sm">{j.title}</p>
                    <p className="text-xs text-gray-500">Budget: {j.budget} ◈</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => resolveDispute(j._id, 'refund_buyer')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-3 py-1.5 rounded transition-colors"
                    >
                      Refund Buyer
                    </button>
                    <button
                      onClick={() => resolveDispute(j._id, 'pay_seller')}
                      className="bg-green-600 hover:bg-green-700 text-white font-black text-xs px-3 py-1.5 rounded transition-colors"
                    >
                      Pay Seller
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b-2 border-gray-200">
          {[
              ['overview', '📊 Overview'], 
              ['users', '👥 Users'], 
              ['jobs', '📋 Jobs'],
              ['ledger', '💰 Financial Ledger']
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-3 text-sm font-black transition-colors border-b-2 -mb-[2px] ${activeTab === key ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              <h2 className="font-black text-gray-900 text-sm uppercase tracking-wider mb-4">Revenue Growth</h2>
              <div className="h-64">
                <Line options={chartOptions} data={revenueData} />
              </div>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              <h2 className="font-black text-gray-900 text-sm uppercase tracking-wider mb-4">User Acquisition</h2>
              <div className="h-64">
                <Line options={chartOptions} data={userGrowthData} />
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="bg-white border-2 border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  {['Name', 'Email', 'Role', 'Status / KYC', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black text-gray-700 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <Link to={`/seller/${u._id}`} className="font-bold text-gray-900 hover:text-blue-600">{u.name}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-black px-2 py-0.5 rounded uppercase ${u.role === 'seller' ? 'bg-blue-100 text-blue-700' : u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex flex-col items-start gap-1">
                      {u.isBanned && <span className="bg-red-600 text-white text-[10px] uppercase font-black px-1.5 py-0.5 rounded">Banned</span>}
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${u.kycStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        KYC: {u.kycStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <div className="flex gap-2">
                          <button onClick={() => banUser(u._id)} className={`text-xs font-bold px-2 py-1 rounded border-2 ${u.isBanned ? 'bg-gray-200 border-gray-400 text-gray-700' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}>
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </button>
                          <button onClick={() => kycUser(u._id, u.kycStatus)} className={`text-xs font-bold px-2 py-1 rounded border-2 ${u.kycStatus === 'verified' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'}`}>
                            {u.kycStatus === 'verified' ? 'Revoke KYC' : 'Verify KYC'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Jobs Table */}
        {activeTab === 'jobs' && (
          <div className="bg-white border-2 border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  {['Title', 'Game', 'Budget', 'Status', 'Posted'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black text-gray-700 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/jobs/${j._id}`} className="font-bold text-gray-900 hover:text-blue-600 line-clamp-1">{j.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{j.game}</td>
                    <td className="px-4 py-3 font-black text-blue-600">{j.budget} ◈</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-black px-2 py-0.5 rounded uppercase ${statusBadge(j.status)}`}>{j.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(j.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Financial Ledger */}
        {activeTab === 'ledger' && (
          <div className="bg-white border-2 border-gray-200 rounded overflow-hidden">
            <div className="bg-gray-50 px-5 py-4 border-b-2 border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-black text-gray-900 uppercase">Platform Transactions</h3>
                <p className="text-xs text-gray-500">History of all diamond purchases and escrow releases.</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2 rounded uppercase tracking-wider transition-colors">
                Export CSV
              </button>
            </div>
            {transactions.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    {['Tx ID', 'Type', 'User', 'Amount', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black text-gray-700 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.id.substring(0, 8)}...</td>
                      <td className="px-4 py-3">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-black px-2 py-0.5 rounded">
                            {t.type}
                          </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">{t.customer_email || 'System'}</td>
                      <td className="px-4 py-3 font-black text-blue-600">+{t.amount / 100} USD</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
                <div className="p-10 text-center">
                    <p className="text-4xl mb-3">💸</p>
                    <p className="font-bold text-gray-800">No transactions recorded yet.</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
