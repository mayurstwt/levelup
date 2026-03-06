import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify-email/${token}`);
                setStatus('success');
                setMessage(res.data.message);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        if (token) {
            verify();
        }
    }, [token]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 border-4 border-dashed border-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-2xl font-black mb-2 text-gray-900">Verifying...</h2>
                        <p className="text-gray-600 font-medium">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-500 border-4 border-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black mb-2 text-green-600 uppercase tracking-tight">Verified!</h2>
                        <p className="text-gray-800 font-bold mb-8">{message}</p>
                        <Link to="/login" className="inline-block w-full bg-blue-600 text-white font-black py-4 px-6 border-4 border-gray-900 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                            Proceed to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-500 border-4 border-gray-900 flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <span className="text-white text-3xl font-black">!</span>
                        </div>
                        <h2 className="text-2xl font-black mb-2 text-red-600 uppercase tracking-tight">Verification Failed</h2>
                        <p className="text-gray-800 font-bold mb-8">{message}</p>
                        <Link to="/" className="inline-block w-full bg-gray-200 text-gray-900 font-black py-4 px-6 border-4 border-gray-900 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                            Back to Home
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
