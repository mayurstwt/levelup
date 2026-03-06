import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatNumber, formatTimeAgo, STATUS_COLORS } from '../../utils/ui-helpers';
import EmptyState from '../../components/EmptyState';

const BuyerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { userJobs } = useSelector((state) => state.jobs);
  const navigate = useNavigate();

  const jobs = userJobs || [];
  
  // Real Data calculations
  const openJobs = jobs.filter(j => j.status === 'open');
  const activeJobs = jobs.filter(j => j.status === 'matched');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  
  const totalSpent = completedJobs.reduce((acc, job) => acc + (job.budget || 0), 0);
  const successRate = completedJobs.length > 0 ? 100 : 0; // Simplified for MVP

  return (
    <div className="min-h-[calc(100vh-48px)] font-sans text-gray-900 selection:bg-blue-200 pb-16">
      
      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-gray-900 pb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-gray-900 leading-none mb-1">
              BUYER COMMAND
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Manage your missions and active boosters
            </p>
          </div>
          <Link to="/post-job" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 transition-colors flex items-center gap-2 shrink-0 border-2 border-gray-900 shadow-[4px_4px_0_0_#111] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#111]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            POST NEW JOB
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div
            onClick={() => document.getElementById('active-missions-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 border-2 border-gray-900 p-5 text-white flex flex-col justify-between h-32 relative overflow-hidden group shadow-[4px_4px_0_0_#111] cursor-pointer hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#111] transition-all"
          >
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-black uppercase tracking-wider">Active Contracts</span>
              <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-black tracking-tighter">{String(activeJobs.length).padStart(2, '0')}</div>
            </div>
          </div>

          <div
            onClick={() => document.getElementById('open-listings-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white border-2 border-gray-900 p-5 text-gray-900 flex flex-col justify-between h-32 relative shadow-[4px_4px_0_0_#111] cursor-pointer hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#111] transition-all"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500">Open Job Posts</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <div>
              <div className="text-4xl font-black tracking-tighter">{String(openJobs.length).padStart(2, '0')}</div>
            </div>
          </div>

          <div
            onClick={() => navigate('/jobs?sortBy=budget')}
            className="bg-[#0cf3e1] border-2 border-gray-900 p-5 text-gray-900 flex flex-col justify-between h-32 relative shadow-[4px_4px_0_0_#111] cursor-pointer hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#111] transition-all"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-wider bg-black/10 px-2 py-1">Total Spent</span>
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div>
               <div className="text-4xl font-black tracking-tighter">{formatCurrency(totalSpent)}</div>
            </div>
          </div>

          <div
            onClick={() => document.getElementById('open-listings-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white border-2 border-gray-900 p-5 text-gray-900 flex flex-col justify-between h-32 relative shadow-[4px_4px_0_0_#111] cursor-pointer hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#111] transition-all"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500">Avg. Success</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
               <div className="text-4xl font-black tracking-tighter">{successRate}%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          
          {/* Active Missions (Matched Jobs) */}
          <div id="active-missions-section" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-gray-900">
              <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <span className="text-blue-600 text-2xl">🏆</span> ACTIVE MISSIONS
              </h2>
            </div>
            
            {activeJobs.length === 0 ? (
              <EmptyState 
                icon="🕵️" 
                title="No active missions" 
                description="Accept a bid to start a mission." 
              />
            ) : (
              <div className="grid gap-4">
                {activeJobs.map(job => (
                  <div key={job._id} className="border-2 border-gray-900 bg-white p-5 relative shadow-[4px_4px_0_0_#111]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{job.game}</span>
                      </div>
                      <span className="bg-[#0cf3e1] text-gray-900 text-[10px] font-black uppercase px-2 py-1 border border-gray-900 shadow-[2px_2px_0_0_#111]">In Progress</span>
                    </div>
                    <h3 className="font-black text-xl leading-tight mb-5 line-clamp-2">{job.title}</h3>
                    
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 mb-5 border-l-4 border-l-blue-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded border border-gray-900 overflow-hidden shrink-0">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${job.sellerId?._id || 'assigned'}`} alt="avatar" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider leading-none mb-1">Assigned Booster</div>
                          <div className="text-sm font-bold leading-none">{job.sellerId?.name || 'Unknown User'}</div>
                        </div>
                      </div>
                      <button onClick={() => navigate(`/chat/${job._id}`)} className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors bg-white">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold pt-2 border-t-2 border-gray-100">
                      <span className="text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Deadline: {job.deadline ? formatTimeAgo(job.deadline) : 'Flexible'}
                      </span>
                      <button onClick={() => navigate(`/jobs/${job._id}`)} className="text-gray-900 bg-gray-100 px-3 py-1.5 border-2 border-gray-900 font-black hover:bg-blue-600 hover:text-white transition-colors uppercase">Briefing &rarr;</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Job Listings */}
          <div id="open-listings-section" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-gray-900">
              <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <span className="text-blue-600 text-2xl">📋</span> OPEN JOB LISTINGS
              </h2>
            </div>

            <div className="border-2 border-gray-900 bg-white overflow-hidden shadow-[4px_4px_0_0_#111]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b-2 border-gray-900 bg-gray-50">
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wider">Mission Name</th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-right">Budget</th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-center">Status</th>
                      <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100">
                    {openJobs.map(job => (
                      <tr key={job._id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-sm leading-tight mb-1">{job.title}</div>
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{job.game}</div>
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
                    {openJobs.length === 0 && (
                      <tr>
                        <td colSpan="4" className="bg-white">
                          <EmptyState 
                            icon="🏝️" 
                            title="No open listings" 
                            description="Post a mission to get started." 
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default BuyerDashboard;
