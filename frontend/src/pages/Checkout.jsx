import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Checkout = () => {
  const { txId } = useParams();
  const navigate = useNavigate();
  const [txDetails, setTxDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  // txId may be a real MongoDB Transaction ID or a jobId (from job detail page)
  useEffect(() => {
    const fetchTx = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${backendUrl}/payments/${txId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTxDetails(res.data);
      } catch {
        // Could be a jobId passed directly from JobDetails
        setTxDetails({ transactionId: txId });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTx();
  }, [txId]);

  const handlePolarCheckout = async () => {
    setRedirecting(true);
    try {
      const token = localStorage.getItem('token');
      // txId could be a jobId — call Polar to create checkout session
      const res = await axios.post(
        `${backendUrl}/polar/create-checkout`,
        { jobId: txDetails?.jobId?._id || txId, amount: txDetails?.amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Polar returns a URL — redirect user to it
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not get payment URL. Please try again.');
        setRedirecting(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
      setRedirecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="font-black text-gray-900 text-2xl uppercase">Secure Checkout</h1>
          <p className="text-gray-500 text-sm mt-1">Powered by Polar — Your payment is protected by escrow</p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white border-2 border-gray-900 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] mb-5">
          <div className="border-b-2 border-gray-100 px-5 py-4">
            <p className="font-black text-gray-900 text-sm uppercase">Order Summary</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction / Job</span>
              <span className="font-mono text-gray-800 text-xs">{txId?.slice(0, 20)}…</span>
            </div>
            {txDetails?.jobId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Job</span>
                <span className="font-semibold text-gray-800">{txDetails.jobId?.title || 'Matched Job'}</span>
              </div>
            )}
            {txDetails?.amount && (
              <>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service Amount</span>
                  <span className="font-semibold text-gray-800">{txDetails.amount} ◈</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform Fee (15%)</span>
                  <span className="text-gray-600">{Math.round(txDetails.amount * 0.15)} ◈</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="font-black text-gray-900 text-sm">Total</span>
                  <span className="font-black text-blue-600 text-lg">{Math.round(txDetails.amount * 1.15)} ◈</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Escrow Info */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-5 text-xs text-blue-700 flex gap-3">
          <span className="text-lg mt-0.5">ℹ️</span>
          <div>
            <p className="font-black mb-1">How Escrow Works</p>
            <p className="leading-relaxed">Your payment is held securely by Polar. It is only released to the seller after you confirm the job is complete. If there's a dispute, our team reviews and mediates.</p>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePolarCheckout}
            disabled={redirecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded text-sm uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            {redirecting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirecting to Polar...</>
            ) : '💳 Pay with Polar →'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full border-2 border-gray-300 hover:border-gray-900 text-gray-600 font-black py-3 rounded text-sm transition-colors"
          >
            Cancel & Return to Dashboard
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-5 mt-6">
          {['🔒 SSL Encrypted', '🛡️ Escrow Protected', '⚡ Polar Payments'].map(b => (
            <span key={b} className="text-xs text-gray-400 font-semibold">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
