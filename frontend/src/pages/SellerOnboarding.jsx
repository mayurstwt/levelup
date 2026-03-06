import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ALL_GAMES = ['Valorant', 'Minecraft', 'BGMI', 'Free Fire', 'Lost Ark', 'World of Warcraft', 'Elden Ring', 'Destiny 2', 'Elder Echoes', 'CyberStrike', 'Other'];

const steps = [
  { n: 1, label: 'Profile' },
  { n: 2, label: 'Games' },
  { n: 3, label: 'Rate' },
];

const SellerOnboarding = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState('');
  const [selectedGames, setSelectedGames] = useState([]);
  const [customGame, setCustomGame] = useState('');
  const [rate, setRate] = useState(500);
  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const toggleGame = (g) => setSelectedGames(
    selectedGames.includes(g) ? selectedGames.filter(x => x !== g) : [...selectedGames, g]
  );

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const games = [...selectedGames, ...(customGame ? [customGame] : [])];
      await axios.put(`${backendUrl}/users/me`, { bio, games, rate }, authHeader);
      if (pan || aadhaar) {
        await axios.put(`${backendUrl}/users/kyc`, { pan, aadhaar }, authHeader);
      }
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="bg-white border-2 border-green-400 rounded shadow-[4px_4px_0px_0px_rgba(74,222,128,0.4)] p-10 text-center">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="font-black text-gray-900 text-2xl uppercase mb-2">Profile Saved!</h2>
          <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded mx-auto flex items-center justify-center mb-3">
            <span className="text-white text-2xl">⚡</span>
          </div>
          <h1 className="font-black text-gray-900 text-2xl uppercase tracking-tight">Seller Onboarding</h1>
          <p className="text-gray-500 text-sm mt-1">Set up your seller profile to start receiving bids</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <button
                onClick={() => setStep(s.n)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wide border-2 transition-colors
                  ${i === 0 ? 'rounded-l' : ''} ${i === steps.length - 1 ? 'rounded-r' : ''}
                  ${step === s.n ? 'bg-blue-600 text-white border-blue-600' : step > s.n ? 'bg-gray-100 text-gray-500 border-gray-300' : 'bg-white text-gray-400 border-gray-200'}`}
              >
                <span className="mr-1">{step > s.n ? '✓' : s.n}</span>{s.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white border-2 border-gray-900 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
          {/* STEP 1: Profile */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="font-black text-gray-900 text-sm uppercase mb-4">👤 Your Profile</h2>
              <div className="mb-5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  readOnly
                  className="w-full border-2 border-gray-200 rounded px-3 py-2.5 text-sm bg-gray-50 text-gray-500"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Bio</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell buyers about your gaming expertise, years of experience, and why they should hire you..."
                  className="w-full border-2 border-gray-300 focus:border-blue-600 rounded px-3 py-2 text-sm outline-none resize-none placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">{bio.length}/300 characters</p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded text-sm uppercase tracking-wide transition-colors"
              >
                Next: Choose Games →
              </button>
            </div>
          )}

          {/* STEP 2: Games */}
          {step === 2 && (
            <div className="p-6">
              <h2 className="font-black text-gray-900 text-sm uppercase mb-4">🎮 Game Specializations</h2>
              <p className="text-xs text-gray-400 mb-4">Select all games you can provide leveling/boosting services for.</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                {ALL_GAMES.filter(g => g !== 'Other').map(g => (
                  <label key={g} className={`flex items-center gap-3 p-3 rounded border-2 transition-all cursor-pointer ${selectedGames.includes(g) ? 'border-blue-600 bg-blue-50 shadow-[2px_2px_0px_0px_rgba(37,99,235,0.4)]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={selectedGames.includes(g)}
                      onChange={() => toggleGame(g)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 group-hover:text-blue-700">{g}</span>
                        {selectedGames.includes(g) && (
                            <span className="text-[10px] text-blue-600 font-bold uppercase mt-0.5 tracking-wider bg-white px-1.5 py-0.5 rounded shadow-sm border border-blue-100 max-w-max">
                                Level {Math.floor(Math.random() * 50) + 10} Badge
                            </span>
                        )}
                    </div>
                  </label>
                ))}
              </div>
              <div className="mb-5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Other Game (optional)</label>
                <input
                  type="text"
                  value={customGame}
                  onChange={e => setCustomGame(e.target.value)}
                  placeholder="Enter game name..."
                  className="w-full border-2 border-gray-300 focus:border-blue-600 rounded px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-300 hover:border-gray-900 text-gray-700 font-black py-3 rounded text-sm transition-colors">← Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedGames.length === 0 && !customGame}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-3 rounded text-sm uppercase tracking-wide transition-colors"
                >
                  Next: Set Rate →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Rate + KYC */}
          {step === 3 && (
            <div className="p-6">
              <h2 className="font-black text-gray-900 text-sm uppercase mb-4">💎 Hourly Rate & Verification</h2>
              <div className="mb-5">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-2">Hourly Rate (◈ Diamonds)</label>
                <div className="flex items-center border-2 border-blue-300 focus-within:border-blue-600 rounded overflow-hidden mb-2">
                  <span className="px-3 py-2.5 bg-blue-50 border-r-2 border-blue-300 text-blue-500 font-black text-sm">◈</span>
                  <input
                    type="number"
                    min={100}
                    value={rate}
                    onChange={e => setRate(Number(e.target.value))}
                    className="flex-1 px-3 py-2.5 text-sm font-black text-gray-900 outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400">Buyers see this rate when browsing your profile.</p>
              </div>

              {/* API Validations (Mock UI) */}
              <div className="mb-6 bg-indigo-50 border-2 border-indigo-200 rounded p-4">
                 <h3 className="font-black text-indigo-900 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                    <span className="text-lg">🎮</span> Skill API Synchronisation
                 </h3>
                 <p className="text-xs text-indigo-700 mb-3 leading-relaxed">
                    Link your Riot, Steam, or Xbox accounts to automatically verify your ranks and display verified skill badges on your profile.
                 </p>
                 <div className="space-y-2">
                    <button className="w-full flex items-center justify-between bg-white border-2 border-indigo-100 hover:border-indigo-400 p-3 rounded transition-colors group">
                        <span className="font-bold text-sm text-gray-800 flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Riot Games Id</span>
                        <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-1 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors">Connect</span>
                    </button>
                    <button className="w-full flex items-center justify-between bg-white border-2 border-indigo-100 hover:border-indigo-400 p-3 rounded transition-colors group">
                        <span className="font-bold text-sm text-gray-800 flex items-center gap-2"><div className="w-3 h-3 bg-gray-800 rounded-full"></div> Steam Community</span>
                        <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-1 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors">Connect</span>
                    </button>
                 </div>
              </div>

              <hr className="border-gray-200 my-5" />

              <div className="mb-4">
                <p className="font-black text-gray-900 text-xs uppercase tracking-wide mb-1">KYC Verification (Optional)</p>
                <p className="text-xs text-gray-400 mb-4">Verifying your identity increases buyer trust. PAN/Aadhaar stored securely.</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">PAN Number</label>
                    <input type="text" value={pan} onChange={e => setPan(e.target.value)} placeholder="ABCDE1234F" className="w-full border-2 border-gray-300 focus:border-blue-600 rounded px-3 py-2 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">Aadhaar Number</label>
                    <input type="text" value={aadhaar} onChange={e => setAadhaar(e.target.value)} placeholder="1234 5678 9012" className="w-full border-2 border-gray-300 focus:border-blue-600 rounded px-3 py-2 text-sm outline-none" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-400 rounded p-3 mb-4 text-sm text-red-700">{error}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-gray-300 hover:border-gray-900 text-gray-700 font-black py-3 rounded text-sm transition-colors">← Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-3 rounded text-sm uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : '✅ Save Profile'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOnboarding;
