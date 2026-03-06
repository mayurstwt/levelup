import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createJob } from '../features/jobs/jobSlice';
import { useNavigate, Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

import { GAMES_LIST, GAME_COLORS } from '../utils/ui-helpers';

// Helper to get image initials
const getInitials = (name) => {
  const parts = name.split(' ');
  return parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase();
};

const gameOptions = GAMES_LIST.map(g => ({
  name: g,
  genre: 'GAME',
  img: `https://placehold.co/120x90/2d1b69/a78bfa?text=${getInitials(g)}`
}));

const conditionOptions = [
  'DAILY QUESTS INCLUDED', 'STREAM GAMEPLAY (LIVE)',
  'KEEP ALL LOOT', 'SPECIFIC GEAR SET REQUIRED',
  'EXPRESS COMPLETION (2X SPEED)', 'OFF-PEAK HOURS ONLY',
];

const PLATFORM_FEE_RATE = 0.10;

const JobPost = () => {
  const [step, setStep] = useState(1);
  const [selectedGame, setSelectedGame] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [conditions, setConditions] = useState([]);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(500);
  const [deadline, setDeadline] = useState('1Week');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  if (user?.role !== 'buyer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="bg-white border-2 border-red-400 rounded p-8 text-center shadow-[4px_4px_0px_0px_rgba(248,113,113,0.5)]">
          <span className="text-4xl mb-4 block">🚫</span>
          <h2 className="font-black text-gray-900 text-xl uppercase mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">Only buyers can post jobs.</p>
        </div>
      </div>
    );
  }

  const toggleCondition = (c) =>
    setConditions(conditions.includes(c) ? conditions.filter(x => x !== c) : [...conditions, c]);

  const platformFee = Math.round(budget * PLATFORM_FEE_RATE);
  const totalCost = budget + platformFee;

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setMediaFiles([...mediaFiles, ...Array.from(e.dataTransfer.files)]);
  };

  const onSubmit = async () => {
    const gameTitle = selectedGame || 'Other';
    if (!serviceType) {
      toast.error('Please select a service type in Step 2');
      setStep(2);
      return;
    }
    if (!description.trim()) {
      toast.error('Please add a job description in Step 2');
      setStep(2);
      return;
    }
    if (!budget || budget < 5) {
      toast.error('Please set a budget of at least $5 in Step 3');
      setStep(3);
      return;
    }
    const result = await dispatch(createJob({
      title: `${gameTitle} – ${targetLevel ? `Lvl ${currentLevel} → ${targetLevel}` : serviceType || 'Boost Request'}`,
      description,
      game: gameTitle,
      serviceType,
      budget: Number(budget),
      timeline: deadline,
    }));
    if (!result.error) navigate('/dashboard');
  };

  const handlePublishClick = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const steps = [
    { n: 1, label: 'GAME' },
    { n: 2, label: 'TARGETS' },
    { n: 3, label: 'BUDGET' },
    { n: 4, label: 'MEDIA' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-0">

      {/* Hero Header */}
      <div className="bg-white border-b-2 border-gray-100 py-10 text-center">
        <h1 className="font-black text-4xl text-gray-900 uppercase tracking-tight">
          POST A <span className="text-blue-600 italic">LEVELING</span> JOB
        </h1>
        <div className="flex justify-center mt-3">
          <p className="text-gray-500 text-sm max-w-md border-l-4 border-blue-600 pl-4 text-left leading-relaxed">
            Reach thousands of verified pro-levelers. Set your own price, define your goals, and watch the bids roll in.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">

          {/* ── MAIN LEFT COLUMN ── */}
          <div className="flex-1 min-w-0">

            {/* Step Tabs */}
            <div className="flex items-center gap-0 mb-8">
              {steps.map((s, i) => (
                <React.Fragment key={s.n}>
                  <button
                    onClick={() => setStep(s.n)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-colors border-2
                      ${step === s.n
                        ? 'bg-blue-600 text-white border-blue-600 rounded'
                        : step > s.n
                        ? 'bg-white text-gray-500 border-gray-300 rounded'
                        : 'bg-white text-gray-400 border-gray-200 rounded'}`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black
                      ${step === s.n ? 'bg-white text-blue-600' : step > s.n ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {step > s.n ? '✓' : s.n}
                    </span>
                    {s.label}
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`h-px w-8 ${step > s.n ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ── STEP 1: GAME ── */}
            {step >= 1 && (
              <section className="mb-8">
                <h2 className="flex items-center gap-2 font-black text-gray-900 text-base uppercase mb-4">
                  <span className="text-gray-400">🎮</span> 01. CHOOSE YOUR GAME
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {gameOptions.map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => setSelectedGame(g.name)}
                      className={`relative rounded overflow-hidden border-2 transition-all text-left
                        ${selectedGame === g.name ? 'border-blue-600 shadow-[3px_3px_0px_0px_rgba(37,99,235,0.4)]' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                      <img src={g.img} alt={g.name} className="w-full h-20 object-cover" />
                      <div className="p-2 bg-white">
                        <p className="font-black text-gray-900 text-xs leading-tight">{g.name}</p>
                        <p className="text-gray-400 text-xs">{g.genre}</p>
                      </div>
                      {selectedGame === g.name && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => { if (!selectedGame) { toast.error('Please select a game first'); return; } setStep(2); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-5 py-2 rounded flex items-center gap-2 transition-colors"
                  >
                    Continue to Mission Targets →
                  </button>
                </div>
              </section>
            )}

            {/* ── STEP 2: MISSION TARGETS ── */}
            {step >= 2 && (
              <section className="mb-8">
                <h2 className="flex items-center gap-2 font-black text-gray-900 text-base uppercase mb-4">
                  <span className="text-gray-400">🎯</span> 02. MISSION TARGETS
                </h2>
                <div className="border-2 border-gray-200 rounded p-5 bg-white">
                  
                  <div className="mb-6">
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Service Type</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none transition-colors font-bold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20fill%3D%22%239CA3AF%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-white cursor-pointer"
                    >
                      <option value="">Select a service category...</option>
                      <option value="Rank Boosting">Rank Boosting</option>
                      <option value="Power Leveling">Power Leveling</option>
                      <option value="Coaching">Coaching</option>
                      <option value="Account Farming">Account Farming</option>
                      <option value="Placement Matches">Placement Matches</option>
                      <option value="Duo Queue">Duo Queue</option>
                      <option value="Win Boosting">Win Boosting</option>
                      <option value="Achievement Unlocking">Achievement Unlocking</option>
                    </select>
                  </div>

                  {/* Dynamic inputs based on service type */}
                  {(serviceType === 'Power Leveling' || serviceType === 'Rank Boosting' || serviceType === 'Win Boosting' || serviceType === 'Account Farming') && (
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">Current Level / Rank</label>
                        <input
                          type="text"
                          value={currentLevel}
                          onChange={(e) => setCurrentLevel(e.target.value)}
                          placeholder={serviceType === 'Rank Boosting' ? 'e.g. Gold 4' : 'e.g. 15'}
                          className="w-full border-2 border-gray-200 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-blue-600 uppercase tracking-wider mb-1.5">Target Level / Rank</label>
                        <input
                          type="text"
                          value={targetLevel}
                          onChange={(e) => setTargetLevel(e.target.value)}
                          placeholder={serviceType === 'Rank Boosting' ? 'e.g. Platinum 1' : 'e.g. 60'}
                          className="w-full border-2 border-blue-200 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}
                  {serviceType === 'Coaching' && (
                    <div className="mb-5">
                      <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">Number of Coaching Sessions</label>
                      <input
                        type="number"
                        value={currentLevel}
                        onChange={(e) => setCurrentLevel(e.target.value)}
                        placeholder="e.g. 3"
                        min={1}
                        className="w-full border-2 border-gray-200 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-400 mt-1">Specify how many 1-hour sessions you want.</p>
                    </div>
                  )}
                  {serviceType === 'Duo Queue' && (
                    <div className="mb-5">
                      <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">Number of Duo Games</label>
                      <input
                        type="number"
                        value={currentLevel}
                        onChange={(e) => setCurrentLevel(e.target.value)}
                        placeholder="e.g. 10"
                        min={1}
                        className="w-full border-2 border-gray-200 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none transition-colors"
                      />
                    </div>
                  )}
                  {serviceType === 'Placement Matches' && (
                    <div className="mb-5">
                      <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">How many placement matches?</label>
                      <input
                        type="number"
                        value={currentLevel}
                        onChange={(e) => setCurrentLevel(e.target.value)}
                        placeholder="e.g. 5"
                        min={1}
                        max={10}
                        className="w-full border-2 border-gray-200 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none transition-colors"
                      />
                    </div>
                  )}
                  {serviceType === 'Achievement Unlocking' && (
                    <div className="mb-5">
                      <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">Achievement / Trophy Name</label>
                      <input
                        type="text"
                        value={targetLevel}
                        onChange={(e) => setTargetLevel(e.target.value)}
                        placeholder="e.g. 'The Undying', '100% completion'"
                        className="w-full border-2 border-gray-200 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none transition-colors"
                      />
                    </div>
                  )}

                  <div className="mb-5">
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-3">Additional Conditions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {conditionOptions.map((c) => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={conditions.includes(c)}
                            onChange={() => toggleCondition(c)}
                            className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                          />
                          <span className="text-xs text-gray-600 group-hover:text-gray-900 font-medium">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 relative">
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5 flex justify-between">
                      Job Description
                      <span className={`text-xs ${description.length > 500 ? 'text-red-500' : 'text-gray-400 font-normal'}`}>
                        ({description.length}/500)
                      </span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                      onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      placeholder="Detail exactly what you need. Be specific about your character's current state and your desired outcomes."
                      className={`w-full border-2 focus:border-blue-500 rounded px-3 py-2 text-sm outline-none transition-colors resize-none placeholder-gray-400 overflow-hidden min-h-[96px] ${description.length >= 500 ? 'border-red-400 text-red-900' : 'border-gray-200'}`}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-gray-700 hover:bg-gray-900 text-white font-black text-sm px-5 py-2 rounded flex items-center gap-2 transition-colors"
                    >
                      Continue to Budget →
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ── STEP 3: BUDGETING ── */}
            {step >= 3 && (
              <section className="mb-8">
                <h2 className="flex items-center gap-2 font-black text-gray-900 text-base uppercase mb-4">
                  <span className="text-gray-400">💎</span> 03. BUDGETING
                </h2>
                <div className="border-2 border-gray-200 rounded p-5 bg-white">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left — offer */}
                    <div>
                      <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                        Your Offer (USD $)
                      </label>
                      <div className="flex items-center border-2 border-green-300 focus-within:border-green-600 rounded overflow-hidden mb-2">
                        <span className="px-3 text-green-600 font-black text-sm bg-green-50 border-r-2 border-green-300 py-2.5">$</span>
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(Number(e.target.value))}
                          className="flex-1 px-3 py-2.5 text-sm font-black text-gray-900 outline-none"
                          min={100}
                        />
                      </div>
                      <p className="text-xs text-gray-400">Higher budgets attract top-tier verified sellers faster.</p>

                      <div className="mt-4">
                        <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Deadline</label>
                        <div className="flex gap-2">
                          {['24Hours', '3Days', '1Week'].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setDeadline(d)}
                              className={`flex-1 py-2 text-xs font-black rounded border-2 transition-colors
                                ${deadline === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-600'}`}
                            >
                              {d === '24Hours' ? '24 Hours' : d === '3Days' ? '3 Days' : '1 Week'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right — breakdown */}
                    <div className="border-2 border-gray-100 rounded p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 font-semibold">Seller Payout</span>
                        <span className="text-sm font-black text-gray-900">${budget}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                        <span className="text-xs text-gray-500 font-semibold">Platform Fee (10%) ⓘ</span>
                        <span className="text-sm font-black text-green-500">+${platformFee}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-gray-800 uppercase">Total Cost</span>
                        <span className="text-lg font-black text-green-600">${totalCost}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        <span className="font-bold text-gray-600">Funds are in SECURE ESCROW</span> and only released when you confirm the job is complete.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="bg-gray-700 hover:bg-gray-900 text-white font-black text-sm px-5 py-2 rounded flex items-center gap-2 transition-colors"
                    >
                      Finalize Media →
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ── STEP 4: VISUAL REFERENCES ── */}
            {step >= 4 && (
              <section className="mb-8">
                <h2 className="flex items-center gap-2 font-black text-gray-900 text-base uppercase mb-4">
                  <span className="text-gray-400">🖼️</span> 04. VISUAL REFERENCES
                </h2>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded p-12 text-center transition-colors
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 border-2 border-gray-300 rounded flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-black text-gray-700 text-sm uppercase mb-1">Drag & Drop Proof</p>
                  <p className="text-gray-400 text-xs mb-4">Attach screenshots of your current inventory or level to help sellers bid accurately.</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 font-black text-xs px-5 py-2 rounded transition-colors"
                  >
                    Browse Files
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => setMediaFiles([...mediaFiles, ...Array.from(e.target.files)])} />
                </div>
                {mediaFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {mediaFiles.map((f, i) => (
                      <span key={i} className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded flex items-center gap-1">
                        📎 {f.name}
                        <button onClick={() => setMediaFiles(mediaFiles.filter((_, j) => j !== i))} className="text-blue-400 hover:text-red-500 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── PUBLISH SECTION ── */}
            <hr className="border-gray-200 mb-6" />

            {/* Ready to publish notice */}
            <div className="border-2 border-cyan-300 bg-cyan-50 rounded p-4 mb-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-black text-gray-800 uppercase mb-0.5">Ready to Publish?</p>
                <p className="text-xs text-gray-500">
                  By clicking below, you agree to our Marketplace Terms and authorize a temporary hold on <span className="font-black text-green-600">${totalCost}</span>.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex flex-col gap-1 bg-red-50 border-2 border-red-400 rounded p-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-red-700 font-semibold">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {typeof error === 'string' ? error : 'Error creating job. Please check your inputs below.'}
                </div>
                <p className="text-xs text-red-500 ml-6">Make sure you have: selected a game (Step 1), chosen a service type &amp; added a description (Step 2), and set a budget ≥ $5 (Step 3).</p>
              </div>
            )}

            <button
              onClick={handlePublishClick}
              disabled={isLoading || !selectedGame}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-4 rounded text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mb-3"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Posting...</>
              ) : 'Publish Leveling Request'}
            </button>
            <p className="text-center text-xs text-gray-400">
              🔒 100% SECURE TRANSACTION & MONEY BACK GUARANTEE
            </p>

            <ConfirmModal 
              isOpen={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              onConfirm={onSubmit}
              title="Confirm Job Post"
              message={`You are about to post this job. A temporary hold of ${totalCost} ◈ will be authorized from your account. Are you sure you wish to proceed?`}
              confirmText="Publish Job"
              confirmColor="bg-blue-600"
            />
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden xl:block w-56 flex-shrink-0 space-y-4">

            {/* Live Preview */}
            <div className="border-2 border-cyan-400 rounded overflow-hidden shadow-[3px_3px_0px_0px_rgba(34,211,238,0.4)]">
              <div className="bg-cyan-400 px-3 py-2 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="font-black text-xs text-black uppercase tracking-wider">Live Preview</span>
              </div>
              <div className="bg-white p-3">
                <div className="flex gap-2 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M6.75 10.5h.008v.008H6.75V10.5z" /></svg>
                  </div>
                  <div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase block mb-0.5">Category</span>
                    <p className="font-black text-gray-900 text-xs">
                      {selectedGame || 'Select a Game'} {serviceType && <span className="text-blue-600 ml-1">• {serviceType}</span>}
                    </p>
                    <p className="text-gray-400 text-xs">Post by {user?.name || 'Alex Gamer'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="border border-gray-100 rounded p-2">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Target</p>
                    <p className="font-black text-gray-900 text-xs">
                      Lvl {currentLevel || '--'} → {targetLevel || '--'}
                    </p>
                  </div>
                  <div className="border border-gray-100 rounded p-2">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Budget</p>
                    <p className="font-black text-gray-900 text-xs">{budget} <span className="text-blue-400">◈</span></p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs font-black text-gray-600 uppercase mb-1">Requirements Summary</p>
                  <p className="text-xs text-gray-400 italic">
                    {conditions.length > 0 ? conditions.join(', ') : 'No requirements added yet...'}
                  </p>
                </div>
                <div className="bg-gray-200 rounded py-2 text-center">
                  <p className="text-xs font-black text-gray-500 uppercase">Waiting for Bids</p>
                </div>
              </div>
            </div>

            {/* Why Hire */}
            <div className="border-2 border-gray-200 rounded p-4 bg-white">
              <p className="font-black text-gray-900 text-xs uppercase tracking-wide mb-3">Why Hire on GameLevelUp?</p>
              <div className="space-y-2.5">
                {[
                  { icon: '✅', title: 'VERIFIED PROS', desc: 'Sellers are background-checked and skill-tested.' },
                  { icon: '🔒', title: 'ESCROW PROTECTION', desc: 'You hold the funds until you are happy.' },
                  { icon: '📊', title: '24/7 MONITORING', desc: 'Our platform tracks progress to ensure safety.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-2">
                    <span className="text-sm flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs font-black text-gray-800 uppercase leading-tight">{item.title}</p>
                      <p className="text-xs text-gray-400 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="border-2 border-dashed border-gray-300 rounded p-4 bg-gray-50">
              <p className="text-xs text-gray-600 italic leading-relaxed mb-2">
                "This is the best way I've found to safely level up my character without risking my account. The escrow system is a game changer!"
              </p>
              <p className="text-xs font-black text-gray-500 uppercase">— SATISFIED BUYER</p>
            </div>
          </aside>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-12 pb-6 mt-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-black">G</div>
                <span className="text-gray-900 font-black text-sm">GameLevelUp Marketplace</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">
                The world's leading marketplace for game leveling and boosting services. Safe, secure, and professional.
              </p>
              <div className="flex gap-3">
                {['f','t','in','yt'].map((s) => (
                  <div key={s} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold cursor-pointer hover:bg-blue-600 hover:text-white transition-colors">{s}</div>
                ))}
              </div>
            </div>
            {[
              { title: 'MARKETPLACE', links: ['All Services', 'Popular Games', 'Top Rated Sellers', 'Success Stories'] },
              { title: 'SUPPORT', links: ['Help Center', 'Safety & Trust', 'Dispute Resolution', 'Contact Us'] },
              { title: 'RESOURCES', links: ["Buyer's Guide", 'Seller Academy', 'Terms of Service', 'Privacy Policy'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-gray-900 font-black text-xs uppercase tracking-wider mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-gray-500 text-xs hover:text-blue-600 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-gray-400 text-xs">© 2024 GameLevelUp Marketplace. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="text-gray-400 text-xs">Server Status: Online</span>
              <span className="text-gray-400 text-xs">Verified Secure Checkout</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobPost;