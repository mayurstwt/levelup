import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatCurrency, STATUS_COLORS } from '../../utils/ui-helpers';
import EmptyState from '../../components/EmptyState';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SellerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { userJobs } = useSelector((state) => state.jobs);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [kycLoading, setKycLoading] = useState(false);

  const jobs = userJobs || [];
  
  // Real Data calculations
  const pendingJobs = jobs.filter(j => j.status === 'open'); // Assuming bids pending are here or we trace by bids
  const activeJobs = jobs.filter(j => j.status === 'matched');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  
  const totalEarnings = completedJobs.reduce((acc, job) => acc + (job.budget || 0), 0);
  const avgRating = user?.rating ? user.rating.toFixed(1) : 'New';

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!pan || !aadhaar) return toast.error('Both PAN and Aadhaar are required');
    setKycLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${backendUrl}/users/kyc`, { pan, aadhaar }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('KYC documents submitted for review!');
      dispatch(updateUser({ kyc: { status: 'pending' } })); // Refresh user data to show updated kyc status
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setKycLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] font-sans text-gray-900 selection:bg-blue-200 pb-16">
      
      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-gray-900 pb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-gray-900 leading-none mb-1">
              SELLER TERMINAL
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Manage your active contracts and gaming career
            </p>
          </div>
          <Link to="/jobs" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 transition-colors flex items-center gap-2 shrink-0 border-2 border-gray-900 shadow-[4px_4px_0_0_#111] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#111]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            FIND NEW GIGS
          </Link>
        </div>

        {/* KYC Verification Banner */}
        {user?.kyc?.status !== 'verified' && (
          <div className={`p-5 border-2 ${user?.kyc?.status === 'pending' ? 'bg-yellow-50 border-yellow-400' : 'bg-red-50 border-red-400'} shadow-[4px_4px_0_0_#111] flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
            <div>
              <h3 className={`text-sm font-black uppercase flex items-center gap-2 ${user?.kyc?.status === 'pending' ? 'text-yellow-800' : 'text-red-800'}`}>
                {user?.kyc?.status === 'pending' ? '⏳ KYC Review Pending' : '⚠️ Identity Verification Required'}
              </h3>
              <p className={`text-xs mt-1 ${user?.kyc?.status === 'pending' ? 'text-yellow-700' : 'text-red-700'}`}>
                {user?.kyc?.status === 'pending' 
                  ? 'Your identity documents are under review by our team. This usually takes 24-48 hours.'
                  : 'Get the "Verified" badge to increase buyer trust and unlock higher tier limits.'}
              </p>
            </div>
            {user?.kyc?.status !== 'pending' && (
              <form onSubmit={handleKycSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <input required type="text" placeholder="PAN Number" value={pan} onChange={e => setPan(e.target.value)} className="border-2 border-gray-900 px-3 py-2 text-sm outline-none w-full sm:w-40" />
                <input required type="text" placeholder="Aadhaar Number" value={aadhaar} onChange={e => setAadhaar(e.target.value)} className="border-2 border-gray-900 px-3 py-2 text-sm outline-none w-full sm:w-48" />
                <button type="submit" disabled={kycLoading} className="bg-gray-900 hover:bg-black text-white px-4 py-2 font-black text-sm uppercase shrink-0 transition-colors">
                  {kycLoading ? '...' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-emerald-500 border-2 border-gray-900 p-5 text-gray-900 flex flex-col justify-between h-32 relative overflow-hidden group shadow-[4px_4px_0_0_#111]">
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-black uppercase tracking-wider">Total Earnings</span>
              <svg className="w-5 h-5 opacity-50 text-gray-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-black tracking-tighter">{formatCurrency(totalEarnings)}</div>
            </div>
          </div>

          <div className="bg-blue-600 border-2 border-gray-900 p-5 text-white flex flex-col justify-between h-32 relative shadow-[4px_4px_0_0_#111]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-wider opacity-80">Active Contracts</span>
              <svg className="w-5 h-5 text-white opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <div className="text-4xl font-black tracking-tighter">{String(activeJobs.length).padStart(2, '0')}</div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-900 p-5 text-gray-900 flex flex-col justify-between h-32 relative shadow-[4px_4px_0_0_#111]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500">Completed Jobs</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
               <div className="text-4xl font-black tracking-tighter">{String(completedJobs.length).padStart(2, '0')}</div>
            </div>
          </div>

          <div className="bg-[#fbbf24] border-2 border-gray-900 p-5 text-gray-900 flex flex-col justify-between h-32 relative shadow-[4px_4px_0_0_#111]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-wider bg-black/10 px-2 py-1">Avg Rating</span>
              <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            </div>
            <div>
               <div className="text-4xl font-black tracking-tighter">{avgRating}</div>
            </div>
          </div>
        </div>

        {/* Contract Management Table */}
        <div className="pt-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-gray-900 mb-6">
            <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-blue-600 text-2xl">⚡</span> ACTIVE & RECENT CONTRACTS
            </h2>
          </div>

          <div className="border-2 border-gray-900 bg-white overflow-hidden shadow-[4px_4px_0_0_#111]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-gray-900 bg-gray-50">
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider">Game & Service</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider">Buyer</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-right">Price</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-center">Status</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-100">
                  {jobs.filter(job => job.status !== 'cancelled').slice(0, 10).map(job => (
                    <tr key={job._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{job.game}</div>
                        <div className="font-bold text-sm leading-tight text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${job.buyerId?._id}`} alt="avatar" className="w-8 h-8 rounded border border-gray-300 bg-gray-200" />
                          <span className="text-xs font-bold text-gray-700">{job.buyerId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-black text-base">{formatCurrency(job.budget)}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2 py-1 text-[10px] font-black uppercase border-2 ${STATUS_COLORS[job.status] || STATUS_COLORS.default}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => navigate(`/jobs/${job._id}`)} className="border-2 border-gray-900 bg-white hover:bg-gray-900 hover:text-white px-4 py-2 text-xs font-black uppercase transition-colors shadow-[2px_2px_0_0_#111]">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                  {jobs.filter(job => job.status !== 'cancelled').length === 0 && (
                    <tr>
                      <td colSpan="5" className="bg-white">
                        <EmptyState 
                          icon="💼" 
                          title="No active contracts" 
                          description="Start bidding to get hired." 
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
};

export default SellerDashboard;
