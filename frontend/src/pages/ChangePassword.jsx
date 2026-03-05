import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../features/auth/authSlice';

const ChangePassword = () => {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading } = useSelector((state) => state.auth);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);

    if (formData.newPassword !== formData.confirmPassword) {
      return setErrorMsg('New passwords do not match');
    }

    try {
      const result = await dispatch(changePassword({ 
        currentPassword: formData.currentPassword, 
        newPassword: formData.newPassword 
      })).unwrap();
      
      setMessage('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setErrorMsg(err || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 border-2 border-gray-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg">
      <h2 className="text-2xl font-black mb-6 uppercase text-gray-900 border-b-4 border-blue-600 inline-block">Change Password</h2>
      
      {message && <div className="p-3 mb-4 bg-green-100 text-green-800 font-bold border-2 border-green-800 rounded">{message}</div>}
      {errorMsg && <div className="p-3 mb-4 bg-red-100 text-red-800 font-bold border-2 border-red-800 rounded">{errorMsg}</div>}

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={onChange}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-900 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={onChange}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-900 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChange}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-900 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:translate-y-1 active:shadow-none transition-all text-white font-black uppercase text-sm border-2 border-gray-900 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
      
      <button onClick={() => navigate('/dashboard')} className="mt-6 text-sm font-bold text-gray-500 hover:text-gray-900 underline">
        &larr; Back to Dashboard
      </button>
    </div>
  );
};

export default ChangePassword;
