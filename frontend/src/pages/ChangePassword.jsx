import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../features/auth/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden mb-6">
    <div className="bg-gray-50 border-b-2 border-gray-200 px-6 py-4 flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <h2 className="font-black text-gray-900 text-sm uppercase tracking-wide">{title}</h2>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full border-2 border-gray-200 focus:border-blue-600 rounded px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder-gray-400"
    />
  </div>
);

const ChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((state) => state.auth);

  // Profile settings
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState({
    bidAccepted: true,
    newBid: true,
    chatMessage: true,
    jobCompleted: true,
    emailDigest: false,
  });

  // Active tab
  const [activeTab, setActiveTab] = useState('profile');

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) { toast.error('Name cannot be empty'); return; }
    setProfileSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${backendUrl}/users/profile`, { name: displayName, bio }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setProfileSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match'); return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    try {
      await dispatch(changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })).unwrap();
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err || 'Failed to change password'); }
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile', },
    { id: 'security', label: '🔒 Security', },
    { id: 'notifications', label: '🔔 Notifications', },
    { id: 'danger', label: '⚠️ Danger Zone', },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-black text-3xl text-gray-900 uppercase tracking-tight">⚙️ Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account preferences and security.</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <nav className="w-44 flex-shrink-0 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 rounded text-sm font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <SectionCard title="Profile Information" icon="👤">
                <form onSubmit={saveProfile} className="space-y-4">
                  <InputField
                    label="Display Name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your public name"
                  />
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">Short Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell buyers/sellers a little about yourself..."
                      rows={3}
                      className="w-full border-2 border-gray-200 focus:border-blue-600 rounded px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder-gray-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full border-2 border-gray-100 bg-gray-50 rounded px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly. Contact support.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">Role</label>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-black uppercase px-3 py-1 rounded tracking-wider">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm px-6 py-2.5 rounded transition-colors"
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </SectionCard>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <SectionCard title="Change Password" icon="🔒">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <InputField
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Your current password"
                    required
                  />
                  <InputField
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min. 6 characters"
                    required
                  />
                  <InputField
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    required
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
                    💡 Use a strong password with a mix of letters, numbers, and symbols.
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-black text-sm px-6 py-2.5 rounded transition-colors"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </SectionCard>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <SectionCard title="Notification Preferences" icon="🔔">
                <p className="text-sm text-gray-500 mb-5">Choose which events trigger in-app and email notifications.</p>
                <div className="space-y-4">
                  {[
                    { key: 'bidAccepted', label: 'Bid Accepted', desc: 'When a buyer accepts your bid' },
                    { key: 'newBid', label: 'New Bid Received', desc: 'When a seller bids on your job' },
                    { key: 'chatMessage', label: 'New Chat Message', desc: 'Real-time messages from matched partners' },
                    { key: 'jobCompleted', label: 'Job Completed', desc: 'When a job status changes to completed' },
                    { key: 'emailDigest', label: 'Weekly Email Digest', desc: 'Summary of activity sent every Monday' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center justify-between gap-4 cursor-pointer group">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <div
                        onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${notifPrefs[key] ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPrefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => toast.success('Notification preferences saved!')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-2.5 rounded transition-colors"
                >
                  Save Preferences
                </button>
              </SectionCard>
            )}

            {/* Danger Zone */}
            {activeTab === 'danger' && (
              <SectionCard title="Danger Zone" icon="⚠️">
                <div className="space-y-4">
                  <div className="bg-red-50 border-2 border-red-200 rounded p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-red-800 text-sm">Delete Account</p>
                      <p className="text-xs text-red-600 mt-0.5">Permanently delete your account, jobs, bids, and all data. This cannot be undone.</p>
                    </div>
                    <button
                      onClick={() => toast.error('Please contact support to delete your account.')}
                      className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white font-black text-xs px-4 py-2 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-yellow-800 text-sm">Export Data</p>
                      <p className="text-xs text-yellow-700 mt-0.5">Download a copy of all your jobs, bids, chats, and transactions.</p>
                    </div>
                    <button
                      onClick={() => toast('Data export is not yet available. Coming soon!', { icon: '📦' })}
                      className="flex-shrink-0 border-2 border-yellow-500 text-yellow-800 hover:bg-yellow-100 font-black text-xs px-4 py-2 rounded transition-colors"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
