import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteJob, getUserJobs } from '../features/jobs/jobSlice';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatTimeAgo, STATUS_COLORS, formatCurrency } from '../utils/ui-helpers';
import ConfirmModal from '../components/ConfirmModal';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange && onChange(s)}
        className={`text-2xl transition-colors ${s <= value ? 'text-yellow-400' : 'text-gray-300'} ${onChange ? 'hover:text-yellow-400' : ''}`}>★</button>
    ))}
  </div>
);

const MOCK_JOB = {
  _id: 'job1', title: 'GRANDMASTER RANK PUSH: SOLO QUEUE ONLY', game: 'League of Legends',
  status: 'open', budget: 2000, timeline: '7 Days',
  description: 'I am looking for a professional booster to take my account from Diamond 2 (65 LP) to Grandmaster. Must have a high win rate and use a VPN for security. I main Mid/Jungle, so please prioritize those roles.',
  buyerId: { _id: 'buyer1', name: 'GamerKing' }, sellerId: null,
  preferredRank: 'CHALLENGER / GM', deadline: 'OCT 25, 2024',
};

const MOCK_BIDS = [
  { _id: 'bid1', sellerId: { _id: 's1', name: 'ProBooster_99', rating: 4.9, reviews: 124, topRated: true }, bidAmount: 1850, estDelivery: '4 Days', message: "I've completed 50+ GM pushes this season. I can start immediately and maintain an 80% win rate.", status: 'pending' },
  { _id: 'bid2', sellerId: { _id: 's2', name: 'KatarinaMain_EUW', rating: 4.7, reviews: 89, topRated: false }, bidAmount: 1600, estDelivery: '6 Days', message: 'Specialist in Mid lane boosting. Affordable and reliable. Check my profile for match history.', status: 'pending' },
  { _id: 'bid3', sellerId: { _id: 's3', name: 'EliteGamerService', rating: 5, reviews: 312, topRated: true }, bidAmount: 2000, estDelivery: '3 Days', message: 'Team of 3 boosters. We offer 24/7 service. Full insurance included in this premium bid.', status: 'pending' },
];

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [existingReviews, setExistingReviews] = useState([]);
  const [myBid, setMyBid] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', budget: '', timeline: '' });

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [bidIdToWithdraw, setBidIdToWithdraw] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [counterForm, setCounterForm] = useState({ amount: '', message: '' });

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = React.useCallback(async () => {
      try {
        if (!id || id === 'preview') { setJob(MOCK_JOB); setBids(MOCK_BIDS); setIsLoading(false); return; }
        const jobRes = await axios.get(`${backendUrl}/jobs/${id}`);
        setJob(jobRes.data);
        setEditForm({
          title: jobRes.data.title,
          description: jobRes.data.description,
          budget: jobRes.data.budget,
          timeline: jobRes.data.timeline
        });
        if (user && jobRes.data.buyerId?._id === user.id) {
          const bidsRes = await axios.get(`${backendUrl}/bids/job/${id}`, authHeader);
          setBids(bidsRes.data);
        }
        if (user?.role === 'seller' && jobRes.data.status === 'open') {
          try {
            const bidsRes = await axios.get(`${backendUrl}/bids/job/${id}`, authHeader);
            const mine = bidsRes.data?.find?.((b) => b.sellerId?._id === user.id || b.sellerId === user.id);
            if (mine) setMyBid(mine);
          } catch (_) {}
        }
        if (jobRes.data.sellerId?._id) {
          const revRes = await axios.get(`${backendUrl}/reviews/user/${jobRes.data.sellerId._id}`);
          setExistingReviews(revRes.data);
        }
      } catch (err) { setJob(MOCK_JOB); setBids(MOCK_BIDS); }
      finally { setIsLoading(false); }
    }, [id, user]);
    
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveJobEdit = async () => {
    setActionLoading(true);
    try {
      const res = await axios.put(`${backendUrl}/jobs/${id}`, editForm, authHeader);
      setJob(res.data);
      setIsEditing(false);
      toast.success('Job updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setActionLoading(false);
    }
  };

  const submitBid = async () => {
    setBidLoading(true); setBidError(null);
    try { await axios.post(`${backendUrl}/bids`, { jobId: id, bidAmount: Number(bidAmount), message: bidMessage }, authHeader); navigate('/dashboard'); }
    catch (err) { setBidError(err.response?.data?.message || 'Failed to submit bid'); }
    finally { setBidLoading(false); }
  };

  const handleApplyClick = (e) => {
    e.preventDefault();
    if (!bidAmount || !bidMessage) {
      setBidError('Please fill out both the bid amount and message.');
      return;
    }
    setShowApplyModal(true);
  };

  const acceptBid = async (bidId) => {
    setActionLoading(true);
    try { 
      await axios.put(`${backendUrl}/bids/${bidId}/accept`, {}, authHeader); 
      await fetchData(); 
      toast.success('Bid accepted successfully!');
    }
    catch (err) { setActionMsg({ type: 'error', text: err.response?.data?.message || 'Error accepting bid' }); }
    finally { setActionLoading(false); }
  };

  const markComplete = async () => {
    setActionLoading(true);
    try { const res = await axios.put(`${backendUrl}/jobs/${id}/complete`, {}, authHeader); setJob(res.data); setActionMsg({ type: 'success', text: 'Job marked as completed!' }); }
    catch (err) { setActionMsg({ type: 'error', text: err.response?.data?.message || 'Error completing job' }); }
    finally { setActionLoading(false); }
  };

  const handleCounterOffer = async (e) => {
    e.preventDefault();
    if (!counterForm.amount) return toast.error('Counter amount is required');
    setActionLoading(true);
    try {
      await axios.post(`${backendUrl}/bids/${selectedBid._id}/counter`, {
        amount: Number(counterForm.amount),
        message: counterForm.message
      }, authHeader);
      toast.success('Counter-offer sent!');
      setShowCounterModal(false);
      setCounterForm({ amount: '', message: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send counter-offer');
    } finally {
      setActionLoading(false);
    }
  };

  const acceptCounter = async (bidId) => {
    setActionLoading(true);
    try {
      await axios.post(`${backendUrl}/bids/${bidId}/counter/accept`, {}, authHeader);
      toast.success('Counter-offer accepted!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept counter');
    } finally {
      setActionLoading(false);
    }
  };

  const raiseDispute = async () => {
    if (!confirm('Are you sure you want to raise a dispute?')) return;
    setActionLoading(true);
    try { const res = await axios.put(`${backendUrl}/jobs/${id}/dispute`, {}, authHeader); setJob(res.data); setActionMsg({ type: 'warning', text: 'Dispute raised. Our team will review within 24 hours.' }); }
    catch (err) { setActionMsg({ type: 'error', text: err.response?.data?.message || 'Error raising dispute' }); }
    finally { setActionLoading(false); }
  };

  const handleWithdrawClick = (bidId) => {
    setBidIdToWithdraw(bidId);
    setShowWithdrawModal(true);
  };

  const withdrawMyBid = async () => {
    if (!bidIdToWithdraw) return;
    try { await axios.delete(`${backendUrl}/bids/${bidIdToWithdraw}`, authHeader); toast.success('Bid withdrawn successfully.'); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.message || 'Could not withdraw bid'); }
  };

  const submitReview = async (e) => {
    e.preventDefault(); if (!reviewRating) return; setReviewLoading(true);
    try { await axios.post(`${backendUrl}/reviews`, { jobId: id, rating: reviewRating, comment: reviewComment }, authHeader); setReviewDone(true); }
    catch (err) { setActionMsg({ type: 'error', text: err.response?.data?.message || 'Error submitting review' }); }
    finally { setReviewLoading(false); }
  };

  const handleReportJob = async () => {
    if (!user) return navigate('/login');
    const reason = window.prompt('Why are you reporting this job? Please provide a brief reason.');
    if (!reason) return;
    try {
      await axios.post(`${backendUrl}/reports`, { jobId: id, reason }, authHeader);
      toast.success('Job reported successfully. Our trust & safety team will review it.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error reporting job');
    }
  };

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '4px solid #4f8ef7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!job) return null;

  const isOwner = user?.id === job.buyerId?._id;
  const isSeller = user?.id === job.sellerId?._id;
  const isMatched = job.status === 'matched';
  const isCompleted = job.status === 'completed';
  const isDisputed = job.status === 'disputed';
  const canReview = isCompleted && (isOwner || isSeller) && !reviewDone;
  const serviceFee = 50;
  const maxTotal = (job.budget || 2000) + serviceFee;

  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: 'Arial, Helvetica, sans-serif' }}>



      {/* BREADCRUMB */}
      <div style={{ background: '#f6f6f8', borderBottom: '1px solid #e5e5ea', padding: '9px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#444', fontSize: 12, cursor: 'pointer', fontWeight: 600, letterSpacing: 0.3 }}>
            ← BACK TO LISTINGS
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {actionMsg && (
          <div style={{ borderRadius: 5, padding: '10px 16px', marginBottom: 16, fontSize: 13, fontWeight: 600, border: '1.5px solid', background: actionMsg.type === 'success' ? '#f0fdf4' : actionMsg.type === 'warning' ? '#fffbeb' : '#fef2f2', borderColor: actionMsg.type === 'success' ? '#86efac' : actionMsg.type === 'warning' ? '#fcd34d' : '#fca5a5', color: actionMsg.type === 'success' ? '#166534' : actionMsg.type === 'warning' ? '#92400e' : '#dc2626' }}>
            {actionMsg.text}
          </div>
        )}

        <div style={{ display: 'flex', gap: 20 }}>
          {/* LEFT */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* JOB CARD */}
            <div style={{ border: '2px solid #222', borderRadius: 6, background: 'white' }}>
              {/* Placeholder banner */}
              <div style={{ height: 150, background: '#ececec', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #ddd' }} />

              <div style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#4f8ef7', color: 'white', fontSize: 10.5, fontWeight: 800, padding: '3px 11px', borderRadius: 3, textTransform: 'uppercase' }}>
                      {job.game || 'League of Legends'}
                    </span>
                    <span style={{ border: '1.5px solid #bbb', color: '#444', fontSize: 10.5, fontWeight: 800, padding: '3px 11px', borderRadius: 3, textTransform: 'uppercase' }}>
                      {job.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {isOwner && job.status === 'open' && (
                    <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', border: '2px solid #222', padding: '4px 12px', fontSize: 11, fontWeight: 800, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>
                      {isEditing ? 'Cancel Edit' : 'Edit Job'}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                     <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ fontWeight: 900, fontSize: 24, padding: '10px 12px', border: '2px solid #222', borderRadius: 4, width: '100%', fontFamily: 'inherit' }} placeholder="Job Title" />
                     <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ fontSize: 13.5, padding: '10px 12px', border: '2px solid #222', borderRadius: 4, width: '100%', minHeight: 120, fontFamily: 'inherit' }} placeholder="Job Description" />
                     <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, marginBottom: 4, textTransform: 'uppercase' }}>Budget</label>
                          <input type="number" value={editForm.budget} onChange={e => setEditForm({...editForm, budget: e.target.value})} style={{ padding: '8px 12px', border: '2px solid #222', borderRadius: 4, width: '100%', fontWeight: 700, fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: 10, fontWeight: 800, marginBottom: 4, textTransform: 'uppercase' }}>Timeline</label>
                          <input type="text" value={editForm.timeline} onChange={e => setEditForm({...editForm, timeline: e.target.value})} style={{ padding: '8px 12px', border: '2px solid #222', borderRadius: 4, width: '100%', fontWeight: 700, fontFamily: 'inherit' }} />
                        </div>
                     </div>
                     <button onClick={saveJobEdit} disabled={actionLoading} style={{ background: '#222', color: 'white', fontWeight: 800, padding: '10px 20px', border: 'none', borderRadius: 4, cursor: 'pointer', alignSelf: 'flex-start', textTransform: 'uppercase' }}>
                       {actionLoading ? 'Saving...' : 'Save Changes'}
                     </button>
                  </div>
                ) : (
                  <>
                    <h1 style={{ fontWeight: 900, fontSize: 28, lineHeight: 1.08, color: '#111', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                      {job.title}
                    </h1>
                    <p style={{ color: '#444', fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{job.description}</p>
                  </>
                )}
              </div>

              {/* Rules + Security */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 22px 20px' }}>
                <div style={{ border: '1.5px solid #ddd', borderRadius: 6, padding: '15px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{ color: '#4f8ef7', fontSize: 16 }}>⊙</span>
                    <span style={{ fontWeight: 800, fontSize: 11, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5 }}>Job Rules</span>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {['No toxicity or flaming in-game.', 'Do not spend Blue Essence or RP.', "Status must remain 'Offline' via Devel software.", 'Daily progress updates via chat are mandatory.'].map((r, i) => (
                      <li key={i} style={{ display: 'flex', gap: 7, fontSize: 12.5, color: '#333', lineHeight: 1.4 }}>
                        <span style={{ marginTop: 2, fontWeight: 900, flexShrink: 0 }}>▪</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ border: '1.5px solid #ddd', borderRadius: 6, padding: '15px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{ color: '#4f8ef7', fontSize: 16 }}>🛡</span>
                    <span style={{ fontWeight: 800, fontSize: 11, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5 }}>Security Protocol</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#333', lineHeight: 1.6, margin: '0 0 12px' }}>
                    Account must be handled with standard SSL-encrypted proxy protocols. 2FA remains active on my mobile.
                  </p>
                  <div style={{ background: '#f4f4f6', border: '1px solid #e0e0e0', borderRadius: 4, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#4f8ef7', fontSize: 13 }}>🔒</span>
                    <span style={{ fontWeight: 700, fontSize: 10.5, color: '#333', textTransform: 'uppercase', letterSpacing: 0.3 }}>Escrow Protected Payment Enabled</span>
                  </div>
                </div>
              </div>

              {/* PAYMENT PIPELINE VISUALIZER */}
              <div style={{ borderTop: '1.5px solid #eee', padding: '20px 22px', background: '#fafafa' }}>
                <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', marginBottom: 16, color: '#111', letterSpacing: 0.5 }}>
                  Payment & Escrow Pipeline
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  {/* Background Track */}
                  <div style={{ position: 'absolute', top: 14, left: 20, right: 20, height: 4, background: '#e5e7eb', zIndex: 0, borderRadius: 2 }}></div>
                  
                  {/* Active Track */}
                  <div style={{ 
                    position: 'absolute', top: 14, left: 20, height: 4, background: '#4f8ef7', zIndex: 1, borderRadius: 2, transition: 'width 0.5s ease',
                    width: isCompleted ? '100%' : isMatched ? '50%' : '0%' 
                  }}></div>

                  {[
                    { label: 'Fund Escrow', active: true, desc: 'Securely Locked' },
                    { label: 'Job Matched', active: isMatched || isCompleted || isDisputed, desc: 'Work Begins' },
                    { label: 'Payout Released', active: isCompleted, desc: 'Funds Sent' }
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: 8, background: '#fafafa', padding: '0 6px' }}>
                      <div style={{ 
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        background: step.active ? '#3b82f6' : '#fff', 
                        border: step.active ? '2px solid #3b82f6' : '2px solid #d1d5db',
                        color: step.active ? 'white' : '#9ca3af',
                        fontWeight: 900, fontSize: 14, transition: 'all 0.3s ease'
                      }}>
                        {step.active ? '✓' : idx + 1}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: step.active ? 800 : 600, color: step.active ? '#111' : '#6b7280', textTransform: 'uppercase' }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched panel */}
              {(isMatched || isCompleted || isDisputed) && (isOwner || isSeller) && (
                <div style={{ borderTop: '2px solid #eee', padding: '16px 22px' }}>
                  <div style={{ borderRadius: 5, padding: '12px 16px', marginBottom: 14, border: '1px solid', background: isCompleted ? '#f0fdf4' : isDisputed ? '#fef2f2' : '#eff6ff', borderColor: isCompleted ? '#86efac' : isDisputed ? '#fca5a5' : '#bfdbfe' }}>
                    <p style={{ fontWeight: 800, fontSize: 12, textTransform: 'uppercase', margin: '0 0 4px' }}>
                      {isCompleted ? '✅ Job Completed' : isDisputed ? '⚠️ Under Dispute' : '🤝 Job Matched'}
                    </p>
                    <p style={{ fontSize: 12, color: '#555', margin: 0 }}>
                      {isCompleted ? 'This job has been marked as complete.' : isDisputed ? 'Admin review in progress.' : 'Connected! Coordinate via chat.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={() => navigate(`/chat/${job._id}`)} style={{ background: '#222', color: 'white', border: 'none', borderRadius: 5, padding: '9px 16px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Open Chat Room</button>
                    {isOwner && isMatched && !isDisputed && (
                      <>
                        <button onClick={markComplete} disabled={actionLoading} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 5, padding: '9px 16px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>{actionLoading ? '...' : '✅ Mark as Complete'}</button>
                        <button onClick={raiseDispute} disabled={actionLoading} style={{ background: 'white', color: '#dc2626', border: '2px solid #dc2626', borderRadius: 5, padding: '9px 16px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>⚠️ Raise Dispute</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ACTIVE BIDS */}
            {bids.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ color: '#c8a000', fontSize: 18 }}>🏆</span>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#111', textTransform: 'uppercase', letterSpacing: 0.3 }}>Active Bids ({bids.length})</span>
                  </div>
                  <span style={{ fontSize: 11.5, color: '#444' }}>SORT BY: <span style={{ fontWeight: 800, textDecoration: 'underline' }}>RELEVANCE</span></span>
                </div>

                <div style={{ background: '#ebebeb', padding: '7px 16px', borderRadius: '5px 5px 0 0', display: 'flex', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>Job Details</span>
                </div>

                <div style={{ border: '1.5px solid #ddd', borderRadius: '0 0 6px 6px', overflow: 'hidden' }}>
                  {bids.map((bid, idx) => (
                    <div key={bid._id} style={{ display: 'flex', alignItems: 'stretch', borderBottom: idx < bids.length - 1 ? '1px solid #e8e8e8' : 'none', background: 'white' }}>
                      {/* Seller col */}
                      <div style={{ width: 150, flexShrink: 0, borderRight: '1px solid #eee', padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 66, height: 66, borderRadius: '50%', background: `hsl(${idx * 80 + 200}, 55%, 52%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 22 }}>
                          {bid.sellerId?.name?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 12, color: '#111', textAlign: 'center' }}>{bid.sellerId?.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <span style={{ color: '#f5a623' }}>★</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#333' }}>{bid.sellerId?.rating}</span>
                          <span style={{ fontSize: 11, color: '#888' }}>({bid.sellerId?.reviews})</span>
                        </div>
                        <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>{bid.sellerId?.completedJobs || 0} Jobs Completed</span>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                          {bid.sellerId?.kyc?.status === 'verified' && (
                            <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 3, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                              Verified
                            </span>
                          )}
                          {bid.sellerId?.topRated && (
                            <span style={{ background: '#4f8ef7', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>Top Rated</span>
                          )}
                        </div>
                      </div>

                      {/* Details col */}
                      <div style={{ flex: 1, padding: '15px 16px' }}>
                        <div style={{ display: 'flex', gap: 28, marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Bid Amount</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 14, color: '#111' }}>
                              <span style={{ color: '#4f8ef7' }}>◈</span>{bid.bidAmount?.toLocaleString()}<span style={{ color: '#4f8ef7', fontSize: 10 }}>◈</span>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Est. Delivery</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 14, color: '#111' }}>
                              <span>⏱</span>{bid.estDelivery || '4 Days'}
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: 12.5, color: '#555', fontStyle: 'italic', margin: '0 0 8px', lineHeight: 1.5 }}>"{bid.message}"</p>
                        <div style={{ display: 'flex', gap: 14 }}>
                          <span style={{ fontSize: 11, color: '#333', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ color: '#4f8ef7' }}>✓</span> Identity Verified</span>
                          <span style={{ fontSize: 11, color: '#333', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ color: '#f5a623' }}>⚡</span> Instant Start</span>
                        </div>
                      </div>

                      {/* Actions col */}
                      <div style={{ flexShrink: 0, padding: '15px 14px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                        {bid.status === 'pending' || (bid.status === 'countered' && bid.counter?.proposedBy === 'seller' && isOwner) ? (
                          <>
                            {isOwner && (
                              <button onClick={() => acceptBid(bid._id)} disabled={actionLoading} style={{ background: '#111', border: 'none', color: 'white', borderRadius: 4, padding: '7px 16px', fontWeight: 800, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                {actionLoading ? '...' : (bid.status === 'countered' ? 'Accept Seller Counter' : 'Accept Bid')}
                              </button>
                            )}
                            <button onClick={() => { setSelectedBid(bid); setShowCounterModal(true); }} disabled={actionLoading} style={{ background: 'white', border: '1.5px solid #333', color: '#111', borderRadius: 4, padding: '7px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Counter Offer
                            </button>
                          </>
                        ) : bid.status === 'countered' ? (
                          <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '8px', borderRadius: 4, textAlign: 'center' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, margin: '0 0 4px', color: '#b45309' }}>COUNTERED ({bid.counter?.amount}◈)</p>
                            {(!isOwner && bid.counter?.proposedBy === 'buyer') ? (
                              <button onClick={() => acceptCounter(bid._id)} disabled={actionLoading} style={{ background: '#f5a623', border: 'none', color: 'white', borderRadius: 4, padding: '5px 10px', fontWeight: 800, fontSize: 11, cursor: 'pointer', width: '100%' }}>
                                Accept Counter
                              </button>
                            ) : (
                              <span style={{ fontSize: 10, color: '#92400e' }}>Waiting for response</span>
                            )}
                          </div>
                        ) : bid.status === 'accepted' ? (
                          <span style={{ background: '#16a34a', color: 'white', fontWeight: 800, fontSize: 11, padding: '6px 12px', borderRadius: 4, textAlign: 'center' }}>Accepted</span>
                        ) : (
                          <span style={{ background: '#dc2626', color: 'white', fontWeight: 800, fontSize: 11, padding: '6px 12px', borderRadius: 4, textAlign: 'center' }}>Rejected</span>
                        )}
                        <button style={{ background: 'white', border: '1.5px solid #ccc', color: '#444', borderRadius: 4, padding: '7px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                          💬 Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEW FORM */}
            {canReview && (
              <div style={{ border: '2px solid #f5a623', borderRadius: 6, background: 'white' }}>
                <div style={{ borderBottom: '2px solid #f5e8b0', background: '#fffde7', padding: '12px 20px' }}>
                  <h2 style={{ fontWeight: 800, fontSize: 12, textTransform: 'uppercase', margin: 0 }}>⭐ Leave a Review</h2>
                </div>
                {reviewDone ? (
                  <div style={{ padding: 24, textAlign: 'center' }}>
                    <p style={{ fontSize: 24, margin: '0 0 8px' }}>🎉</p>
                    <p style={{ fontWeight: 800, margin: 0 }}>Review submitted! Thank you.</p>
                  </div>
                ) : (
                  <form onSubmit={submitReview} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Your Rating</label>
                      <StarRating value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', marginBottom: 5 }}>Comment (optional)</label>
                      <textarea rows={3} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Describe your experience..." style={{ width: '100%', border: '2px solid #ddd', borderRadius: 4, padding: '8px 10px', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" disabled={!reviewRating || reviewLoading} style={{ background: '#f5a623', border: 'none', color: '#111', borderRadius: 4, padding: '9px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start' }}>
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* EXISTING REVIEWS */}
            {existingReviews.length > 0 && (
              <div style={{ border: '1.5px solid #ddd', borderRadius: 6, background: 'white', padding: '18px 20px' }}>
                <h2 style={{ fontWeight: 800, fontSize: 12, textTransform: 'uppercase', margin: '0 0 14px' }}>Reviews for {job.sellerId?.name}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {existingReviews.map((r) => (
                    <div key={r._id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <StarRating value={r.rating} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#666' }}>{r.reviewerId?.name}</span>
                      </div>
                      {r.comment && <p style={{ fontSize: 13, color: '#555', fontStyle: 'italic', margin: 0 }}>"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BID FORM / MY BID */}
            {user?.role === 'seller' && job.status === 'open' && (
              myBid ? (
                <div style={{ border: '2px solid #4f8ef7', borderRadius: 6, background: 'white' }}>
                  <div style={{ borderBottom: '2px solid #bcd4fb', background: '#eff6ff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontWeight: 800, fontSize: 12, textTransform: 'uppercase', margin: 0 }}>Your Active Bid</h2>
                    <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>{myBid.status}</span>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: '#666' }}>Bid Amount</span>
                      <span style={{ fontWeight: 800, color: '#4f8ef7', fontSize: 16 }}>{myBid.bidAmount} ◈</span>
                    </div>
                    {myBid.message && <p style={{ fontSize: 12, color: '#666', fontStyle: 'italic', background: '#f9f9f9', border: '1px solid #eee', borderRadius: 4, padding: '8px 10px', marginBottom: 14, margin: '0 0 14px' }}>"{myBid.message}"</p>}
                    <button onClick={() => handleWithdrawClick(myBid._id)} style={{ width: '100%', background: 'white', border: '2px solid #dc2626', color: '#dc2626', borderRadius: 4, padding: 9, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>🗑 Withdraw Bid</button>
                  </div>
                </div>
              ) : (
                <div style={{ border: '1.5px solid #ddd', borderRadius: 6, background: 'white', padding: 24, marginTop: 24 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: '0 0 16px' }}>
                     Apply for this Job
                  </h3>
                  {bidError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 4, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                      {bidError}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#444', textTransform: 'uppercase', marginBottom: 6 }}>Your Price (◈)</label>
                      <input 
                        type="number" 
                        value={bidAmount} 
                        onChange={e => setBidAmount(e.target.value)} 
                        placeholder={job.budget?.toString() || '2000'}
                        style={{ width: '100%', border: '2px solid #333', borderRadius: 4, padding: '10px 14px', fontSize: 16, fontWeight: 800, fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#444', textTransform: 'uppercase', marginBottom: 6 }}>Proposal Message</label>
                      <textarea 
                        value={bidMessage} 
                        onChange={e => setBidMessage(e.target.value)} 
                        placeholder="Explain why you're the best booster for this specific job. Mention your peak rank and average completion time..."
                        rows={4}
                        style={{ width: '100%', border: '2px solid #ccc', borderRadius: 4, padding: '10px 14px', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside style={{ width: 255, flexShrink: 0 }}>
            <div style={{ border: '2px solid #111', borderRadius: 6, background: 'white', position: 'sticky', top: 16 }}>
              <div style={{ background: '#111', padding: '11px 18px', borderRadius: '4px 4px 0 0' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Job Summary</span>
              </div>

              <div style={{ padding: '16px 18px 0' }}>
                {[
                  { icon: '📍', label: 'Budget Range', value: `${formatCurrency((job.budget || 2000) * 0.8)} - ${formatCurrency((job.budget || 2000) * 1.2)}` },
                  { icon: '⏰', label: 'Application Deadline', value: job.deadline ? formatTimeAgo(job.deadline) : 'Flexible' },
                  { icon: '🏅', label: 'Preferred Rank', value: job.preferredRank || 'CHALLENGER / GM' },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 13 }}>
                    <span style={{ fontSize: 18, marginTop: 1, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontWeight: 800, fontSize: 12.5, color: '#111', display: 'flex', alignItems: 'center', gap: 3 }}>
                        {value}
                      </div>
                    </div>
                  </div>
                ))}

                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 0 12px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Service Fee</span>
                  <span style={{ fontWeight: 800, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 3 }}>{serviceFee}<span style={{ color: '#4f8ef7', fontSize: 10 }}>◈</span></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#111' }}>Max Total</span>
                  <span style={{ fontWeight: 900, fontSize: 15, color: '#4f8ef7', display: 'flex', alignItems: 'center', gap: 3 }}>{maxTotal.toLocaleString()}<span style={{ fontSize: 11 }}>◈</span></span>
                </div>

                {isOwner && job.status === 'open' ? (
                  <>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Cancel this job posting? This cannot be undone.')) return;
                        setActionLoading(true);
                        try {
                          await axios.put(`${backendUrl}/jobs/${id}`, { status: 'cancelled' }, authHeader);
                          dispatch(deleteJob(id)); // Remove from local UI state
                          dispatch(getUserJobs()); // Re-fetch dashboard jobs just in case
                          toast.success('Job posting cancelled.');
                          navigate('/dashboard');
                        } catch (err) {
                          toast.error(err.response?.data?.message || 'Could not cancel posting');
                        } finally { setActionLoading(false); }
                      }}
                      disabled={actionLoading}
                      style={{ width: '100%', background: 'white', color: '#dc2626', border: '1.5px solid #dc2626', borderRadius: 4, padding: 11, fontWeight: 800, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
                    >
                      {actionLoading ? '...' : '🗑 Cancel Posting'}
                    </button>
                  </>
                ) : user?.role === 'seller' && job.status === 'open' && !myBid ? (
                  <>
                    <button onClick={handleApplyClick} disabled={bidLoading} style={{ width: '100%', background: '#4f8ef7', color: 'white', border: 'none', borderRadius: 4, padding: 11, fontWeight: 800, fontSize: 13, cursor: 'pointer', marginBottom: 8 }}>{bidLoading ? 'Submitting...' : 'Submit Proposal'}</button>
                    <button
                      onClick={() => {
                        const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
                        if (!saved.includes(id)) {
                          localStorage.setItem('savedJobs', JSON.stringify([...saved, id]));
                          toast.success('Job saved! Find it in Browse Jobs.');
                        } else {
                          toast('Job already saved.', { icon: '📌' });
                        }
                      }}
                      style={{ width: '100%', background: 'white', color: '#333', border: '1.5px solid #ccc', borderRadius: 4, padding: 11, fontWeight: 800, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
                    >
                      📌 Save Job
                    </button>
                  </>
                ) : null}
                
                {/* Flag Job Button */}
                {!isOwner && (
                  <button
                    onClick={handleReportJob}
                    style={{ background: 'none', border: 'none', width: '100%', fontSize: 11, color: '#888', textDecoration: 'underline', marginTop: 12, marginBottom: 16, cursor: 'pointer' }}
                  >
                    🚩 Report this listing
                  </button>
                )}
              </div>

              {/* Safety Tip */}
              <div style={{ margin: '0 14px 14px', border: '1.5px solid #c8e0fb', borderRadius: 5, background: '#eef5ff', padding: '11px 13px', display: 'flex', gap: 8 }}>
                <span style={{ color: '#4f8ef7', fontSize: 16, flexShrink: 0, marginTop: 1 }}>ℹ</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 10.5, color: '#111', textTransform: 'uppercase', marginBottom: 4 }}>Safety Tip</div>
                  <p style={{ fontSize: 11, color: '#444', lineHeight: 1.5, margin: 0 }}>Never share your password directly. Our system uses secure tokens to facilitate account access for boosters.</p>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1.5px solid #eee' }}>
                <div style={{ padding: '10px 0', textAlign: 'center', borderRight: '1px solid #eee' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Views</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>1.2k</div>
                </div>
                <div style={{ padding: '10px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Bids</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>{bids.length}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#f8f8f8', borderTop: '1px solid #e0e0e0', marginTop: 44, padding: '32px 24px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr 1fr', gap: 32, marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ background: '#4f8ef7', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <span style={{ color: '#4f8ef7', fontWeight: 800, fontSize: 12 }}>GameLevelUp Marketplace</span>
              </div>
              <p style={{ fontSize: 11.5, color: '#666', lineHeight: 1.6, margin: '0 0 12px' }}>The world's leading marketplace for game leveling and boosting services. Safe, secure, and professional.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['f', '𝕏', '📷', '▶'].map((icon, i) => (
                  <span key={i} style={{ width: 26, height: 26, background: '#e0e0e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, cursor: 'pointer', color: '#555' }}>{icon}</span>
                ))}
              </div>
            </div>
            {[
              { title: 'Marketplace', links: ['All Services', 'Popular Games', 'Top Rated Sellers', 'Success Stories'] },
              { title: 'Support', links: ['Help Center', 'Safety & Trust', 'Dispute Resolution', 'Contact Us'] },
              { title: 'Resources', links: ['Buyer Guide', 'Seller Academy', 'Terms of Service', 'Privacy Policy'] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{ fontWeight: 800, fontSize: 11, textTransform: 'uppercase', color: '#111', letterSpacing: 0.5, marginBottom: 10 }}>{col.title}</div>
                {col.links.map((link) => (
                  <div key={link} style={{ marginBottom: 7 }}>
                    <a href="#" style={{ color: '#555', fontSize: 12, textDecoration: 'none' }}>{link}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#888' }}>© 2024 GameLevelUp Marketplace. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 18 }}>
              <span style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
                Server Status: Online
              </span>
              <span style={{ fontSize: 11, color: '#888' }}>✓ Verified Secure Checkout</span>
            </div>
          </div>
        </div>
      </footer>

      <ConfirmModal 
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onConfirm={submitBid}
        title="Confirm Proposal"
        message={`You are about to submit a bid of ${bidAmount} ◈ for this job. You will be bound by the platform SLAs if the buyer accepts. Proceed?`}
        confirmText="Submit Bid"
        confirmColor="bg-blue-600"
      />

      <ConfirmModal 
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={withdrawMyBid}
        title="Withdraw Bid"
        message="Are you sure you want to withdraw your bid? This action cannot be undone."
        confirmText="Withdraw"
        confirmColor="bg-red-600"
      />

      {showCounterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 8, width: '100%', maxWidth: 400, padding: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Propose Counter-Offer</h2>
            <form onSubmit={handleCounterOffer}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>New Price (◈)</label>
                <input required type="number" min="1" value={counterForm.amount} onChange={e => setCounterForm({...counterForm, amount: e.target.value})} style={{ width: '100%', border: '1px solid #ccc', borderRadius: 4, padding: 10, fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Message (optional)</label>
                <textarea rows="3" value={counterForm.message} onChange={e => setCounterForm({...counterForm, message: e.target.value})} style={{ width: '100%', border: '1px solid #ccc', borderRadius: 4, padding: 10, fontSize: 14 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowCounterModal(false)} style={{ background: 'transparent', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ background: '#111', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}>{actionLoading ? '...' : 'Send Counter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;