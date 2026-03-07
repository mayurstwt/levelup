import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { withdrawBid } from '../features/jobs/jobSlice';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate } from '../utils/ui-helpers';

const MyBids = () => {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [bidIdToWithdraw, setBidIdToWithdraw] = useState(null);
    const dispatch = useDispatch();
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const res = await axios.get(`${backendUrl}/bids/mine`);
                setBids(res.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load your bids');
                setLoading(false);
            }
        };
        fetchBids();
    }, [backendUrl]);

    const handleWithdrawClick = (bidId) => {
        setBidIdToWithdraw(bidId);
        setShowWithdrawModal(true);
    };

    const confirmWithdrawal = async () => {
        if (!bidIdToWithdraw) return;
        try {
            await dispatch(withdrawBid(bidIdToWithdraw)).unwrap();
            setBids(bids.filter(b => b._id !== bidIdToWithdraw));
            setShowWithdrawModal(false);
            toast.success('Bid withdrawn successfully');
        } catch (err) {
            toast.error(err || 'Failed to withdraw bid');
        }
    };

    if (loading) return <div className="p-8 text-center font-bold text-gray-500 text-lg">Loading bids...</div>;

    return (
        <>
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-black mb-6 uppercase text-gray-900 border-b-4 border-blue-600 inline-block">🚀 My Bids</h1>
                {error && <div className="mb-4 p-4 border-2 border-red-600 bg-red-100 text-red-800 font-bold">{error}</div>}

                {bids.length === 0 ? (
                    <div className="mt-8 text-center py-16 bg-white border-2 border-gray-200 border-dashed rounded-lg shadow-sm">
                        <p className="text-gray-500 font-bold text-lg mb-4">You haven't placed any bids yet.</p>
                        <Link to="/jobs" className="inline-block px-6 py-3 bg-blue-600 text-white font-black uppercase text-sm rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                            Find Jobs to Bid On &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bids.map((bid) => (
                            <div key={bid._id} className="bg-white border-2 border-gray-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-transform hover:-translate-y-1">
                                <div className="flex-1">
                                    <span className={`text-xs font-black px-2 py-1 rounded inline-block uppercase mb-2 border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                        bid.status === 'accepted' ? 'bg-green-400 text-gray-900' :
                                        bid.status === 'rejected' ? 'bg-red-400 text-gray-900' :
                                        'bg-yellow-400 text-gray-900'
                                    }`}>
                                        {bid.status}
                                    </span>
                                    <Link to={`/jobs/${bid.jobId?._id}`} className="block text-xl font-black text-gray-900 hover:text-blue-600 transition-colors uppercase truncate">
                                        {bid.jobId?.title || 'Deleted Job'}
                                    </Link>
                                    <p className="text-gray-600 font-medium text-sm mt-1 mb-2 line-clamp-2">{bid.message}</p>
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-800">Your Bid: </span>
                                        <span className="text-green-600 font-black">₹{bid.bidAmount}</span>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span className="font-bold text-gray-800">Date: </span>
                                    <span className="text-gray-600 font-medium">{formatDate(bid.createdAt)}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 shrink-0">
                                    <Link to={`/jobs/${bid.jobId?._id}`} className="px-4 py-2 border-2 border-gray-900 bg-white hover:bg-gray-100 font-bold uppercase text-xs rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all">
                                        View Job
                                    </Link>
                                    {(bid.status === 'pending') && (
                                        <button
                                            onClick={() => handleWithdrawClick(bid._id)}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold uppercase text-xs rounded border-2 border-gray-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onConfirm={confirmWithdrawal}
                title="Withdraw Bid"
                message="Are you sure you want to withdraw your bid? This action cannot be undone."
                confirmText="Withdraw"
                confirmColor="bg-red-600"
            />
        </>
    );
};

export default MyBids;
