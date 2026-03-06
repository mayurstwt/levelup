import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getJobs } from '../features/jobs/jobSlice';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { GAMES_LIST, GAME_COLORS, formatCurrency, formatTimeAgo, formatNumber, getAvatarGradient } from '../utils/ui-helpers';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';

const JobListing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const gameQuery = searchParams.get('game') || '';

  const [search, setSearch] = useState(gameQuery);
  const [activeTab, setActiveTab] = useState('active');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFab, setShowFab] = useState(false);

  // Filter state
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(5000);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [gameOpen, setGameOpen] = useState(true);
  const [serviceOpen, setServiceOpen] = useState(true);

  const { jobs, totalJobs, totalPages, isLoading } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  // Derive active filter tags for display
  const activeTags = [
    ...selectedGames,
    ...selectedServices,
    budgetMax < 5000 ? `Under ${budgetMax}◈` : null,
    sortBy ? `Sort: ${sortBy}` : null,
  ].filter(Boolean);

  // Core dispatch function
  const applyFilters = useCallback((page = 1) => {
    const filters = {
      game: selectedGames[0] || '',
      serviceType: selectedServices[0] || '',
      budgetMin: budgetMin > 0 ? budgetMin : '',
      budgetMax: budgetMax < 5000 ? budgetMax : '',
      search: search || '',
      sortBy,
      page,
      limit: 9,
    };
    // Sync URL
    const params = {};
    if (filters.game) params.game = filters.game;
    if (filters.search) params.search = filters.search;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (page > 1) params.page = page;
    setSearchParams(params);
    dispatch(getJobs(filters));
  }, [selectedGames, selectedServices, budgetMin, budgetMax, sortBy, search, gameQuery, dispatch, setSearchParams]);


  // Initial load
  useEffect(() => {
    dispatch(getJobs({ game: gameQuery, sortBy, page: 1, limit: 9 }));
  }, [dispatch]);

  // Sort change triggers immediate refetch
  useEffect(() => {
    applyFilters(1);
  }, [sortBy]);

  // Scroll-to-top FAB visibility
  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    applyFilters(page);
  };

  const toggleFilter = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  // Auto-apply when game/service filter changes
  const toggleGame = (g) => {
    const next = selectedGames.includes(g) ? selectedGames.filter(v => v !== g) : [...selectedGames, g];
    setSelectedGames(next);
    const filters = { game: next[0] || '', serviceType: selectedServices[0] || '', search: search || '', sortBy, page: 1, limit: 9 };
    dispatch(getJobs(filters));
  };

  const toggleService = (s) => {
    const next = selectedServices.includes(s) ? selectedServices.filter(v => v !== s) : [...selectedServices, s];
    setSelectedServices(next);
    const filters = { game: selectedGames[0] || '', serviceType: next[0] || '', search: search || '', sortBy, page: 1, limit: 9 };
    dispatch(getJobs(filters));
  };

  // Using global GAMES_LIST
  const gameCategories = GAMES_LIST;

  // Real service types — matches the serviceType field in Job model
  const serviceTypes = [
    'Rank Boosting', 'Power Leveling', 'Coaching', 'Account Farming',
    'Placement Matches', 'Duo Queue', 'Win Boosting', 'Achievement Unlocking',
  ];

  const ratingOptions = ['4+', '3+', '2+'];

  const displayJobs = jobs;
  const displayTotal = totalJobs;
  const displayPages = totalPages;

  const gameBadgeColor = (game) => {
    return GAME_COLORS[game] || 'bg-gray-600 text-white';
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">Browse Marketplace</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* ── SIDEBAR FILTERS ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white border-2 border-gray-900 rounded p-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-gray-900 text-sm uppercase tracking-wider">Filters</span>
                <button className="text-gray-400 hover:text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>

              {/* Game Category */}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => setGameOpen(o => !o)}
                  className="flex items-center justify-between w-full mb-2 group"
                >
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Game Category</span>
                  <svg className={`w-3 h-3 text-gray-400 transition-transform ${gameOpen ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {gameOpen && (
                  <div className="space-y-2">
                    {gameCategories.map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedGames.includes(g)}
                          onChange={() => toggleGame(g)}
                          className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-gray-900">{g}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-gray-200 mb-4" />

              {/* Service Type */}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => setServiceOpen(o => !o)}
                  className="flex items-center justify-between w-full mb-2 group"
                >
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Service Type</span>
                  <svg className={`w-3 h-3 text-gray-400 transition-transform ${serviceOpen ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {serviceOpen && (
                  <div className="space-y-2">
                    {serviceTypes.map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(s)}
                          onChange={() => toggleService(s)}
                          className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-gray-900">{s}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-gray-200 mb-4" />

              {/* Budget Range */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Budget Range</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full accent-blue-600 mb-3"
                />
                <div className="flex gap-2">
                  <div className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 text-center font-semibold">
                    {budgetMin} <span className="text-blue-500">◈</span>
                  </div>
                  <div className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 text-center font-semibold">
                    {budgetMax} <span className="text-blue-500">◈</span>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 mb-4" />

              {/* Seller Rating */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Seller Rating</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
                <div className="space-y-2">
                  {ratingOptions.map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(r)}
                        onChange={() => toggleFilter(selectedRatings, setSelectedRatings, r)}
                        className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-xs text-gray-600 group-hover:text-gray-900">{r} ☆</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => applyFilters(1)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-2.5 rounded transition-colors uppercase tracking-wide"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setSelectedGames([]);
                  setSelectedServices([]);
                  setBudgetMin(0);
                  setBudgetMax(5000);
                  setSortBy('');
                  dispatch(getJobs({ page: 1, limit: 9 }));
                }}
                className="w-full mt-2 border-2 border-gray-300 hover:border-gray-900 text-gray-600 font-black text-xs py-2 rounded transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0">

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-0 mb-5 border-2 border-gray-900 rounded overflow-hidden">
              <div className="flex items-center px-3 bg-white">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for games, level ranges, or services..."
                className="flex-1 bg-white px-2 py-3 text-sm text-gray-700 outline-none placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-700 text-white font-black px-8 py-3 text-sm uppercase tracking-wide transition-colors"
              >
                Search
              </button>
            </form>

            {/* Tabs + Sort */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-5 py-2 text-sm font-black border-2 rounded-l transition-colors ${activeTab === 'active' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-900'}`}
                >
                  Active Jobs
                </button>
                <button
                  onClick={() => setActiveTab('seller')}
                  className={`px-5 py-2 text-sm font-black border-2 border-l-0 rounded-r transition-colors ${activeTab === 'seller' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-900'}`}
                >
                  Seller Services
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-2 border-gray-300 rounded px-3 py-2 text-sm text-gray-600 font-semibold outline-none cursor-pointer hover:border-gray-900 transition-colors bg-white"
                >
                  <option value="">SORT BY:</option>
                  <option value="newest">Newest First</option>
                  <option value="budget_high">Budget: High to Low</option>
                  <option value="budget_low">Budget: Low to High</option>
                  <option value="deadline">Deadline Soonest</option>
                </select>
                <button className="border-2 border-gray-300 hover:border-gray-900 rounded p-2 transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button className="border-2 border-gray-300 hover:border-gray-900 rounded p-2 transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Results count + active tags */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-sm text-gray-600 font-semibold">
                SHOWING{' '}
                <span className="text-blue-600 font-black">
                  {displayJobs.length}
                </span>{' '}
                OF <span className="font-black text-gray-900">{displayTotal}</span> OPEN JOBS
              </p>
              <div className="flex gap-2 flex-wrap">
                {activeTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Buyer alert */}
            {user?.role === 'buyer' && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-700">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                You are viewing the marketplace as a buyer. Only sellers can bid on these jobs.
              </div>
            )}

            {/* Job Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((sk) => (
                  <Skeleton key={sk} type="job-card" />
                ))}
              </div>
            ) : displayJobs.length === 0 ? (
              <EmptyState 
                title="No Jobs Found" 
                description="We couldn't locate any requested jobs matching your current filters and search criteria."
                action={
                  <button
                    onClick={() => {
                      setSelectedGames([]);
                      setSelectedServices([]);
                      setSearch('');
                      setBudgetMin(0);
                      setBudgetMax(5000);
                      setSortBy('');
                      dispatch(getJobs({ page: 1, limit: 9 }));
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-2.5 rounded transition-colors"
                  >
                    Clear All Filters
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayJobs.map((job) => (
                  <div key={job._id} className="bg-white border-2 border-gray-200 rounded overflow-hidden hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
                    {/* Card Image */}
                    <div className="relative">
                      <img
                        src={job.img || `https://placehold.co/380x160/1e1b4b/818cf8?text=${encodeURIComponent(job.title || 'Service')}`}
                        alt={job.title}
                        className="w-full h-36 object-cover"
                      />
                      <span className={`absolute top-2 left-2 ${gameBadgeColor(job.game)} text-xs font-black px-2 py-0.5 rounded uppercase shadow-sm`}>
                        {job.game}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-black text-gray-900 text-sm leading-tight flex-1 mr-2 line-clamp-2" title={job.title}>{job.title}</h3>
                        <span className="text-blue-600 font-black text-sm whitespace-nowrap flex items-center gap-0.5">
                          {formatCurrency(job.budget)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                          <span className="text-gray-400 text-[10px]">⚡</span>
                          <span className="text-gray-600 text-xs font-bold uppercase tracking-wide">{job.serviceType || job.timeline}</span>
                        </div>
                        {(job.targetRank || job.preferredRank) && (
                          <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                            <span className="text-indigo-600 text-[10px]">🎯</span>
                            <span className="text-indigo-700 text-xs font-bold uppercase tracking-wide">{job.targetRank || job.preferredRank}</span>
                          </div>
                        )}
                      </div>

                      <hr className="border-gray-100 mb-3" />

                      {/* Seller row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-black text-gray-700">
                            {(job.seller || job.buyerId?.name || 'S')?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-600 font-semibold">{job.seller || job.buyerId?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-xs">☆</span>
                          <span className="text-xs font-bold text-gray-700">{job.rating || '—'}</span>
                          {job.reviews && <span className="text-xs text-gray-400">({formatNumber(job.reviews)})</span>}
                        </div>
                      </div>

                    {/* Bid count + CTA */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-bold text-gray-500 uppercase">{job.deadline ? formatTimeAgo(job.deadline) : 'Flexible'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.bidCount > 0 && (
                            <span className="text-xs text-orange-600 font-black bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                              {formatNumber(job.bidCount)} bid{job.bidCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          <Link
                            to={`/jobs/${job._id}`}
                            className="text-blue-600 hover:text-blue-800 text-xs font-black uppercase tracking-wide transition-colors no-underline"
                          >
                            View →
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {displayPages > 1 && (
              <div className="flex justify-center items-center gap-1 mt-8">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded border-2 text-sm font-bold bg-white text-gray-600 border-gray-300 hover:border-gray-900 disabled:opacity-40"
                >«</button>
                {Array.from({ length: Math.min(displayPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded border-2 text-sm font-bold transition-colors
                      ${p === currentPage
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-900'}`}
                  >{p}</button>
                ))}
                <button
                  onClick={() => handlePageChange(Math.min(displayPages, currentPage + 1))}
                  disabled={currentPage === displayPages}
                  className="w-9 h-9 flex items-center justify-center rounded border-2 text-sm font-bold bg-white text-gray-600 border-gray-300 hover:border-gray-900 disabled:opacity-40"
                >»</button>
              </div>
            )}

            {/* CTA Banner */}
            <div className="mt-10 bg-white border-2 border-gray-200 rounded p-6 flex items-center justify-between gap-6 flex-wrap">
              <div className="flex-1">
                <h3 className="font-black text-gray-900 text-xl uppercase leading-tight mb-1">
                  READY TO LEVEL UP YOUR EARNINGS?
                </h3>
                <p className="text-blue-600 font-semibold text-sm">
                  Professional players are earning up to 50k <span className="text-blue-400">◈</span> monthly. Join our elite circle of sellers today.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/become-seller')}
                  className="bg-gray-900 hover:bg-gray-700 text-white font-black px-5 py-2.5 rounded text-sm transition-colors"
                >
                  Become a Seller
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="border-2 border-gray-300 hover:border-gray-900 text-gray-700 font-black px-5 py-2.5 rounded text-sm transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-12 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-6">
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
                {['f', 't', 'in', 'yt'].map((s) => (
                  <div key={s} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold cursor-pointer hover:bg-blue-600 hover:text-white transition-colors">
                    {s}
                  </div>
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
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-6 z-50 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white border-2 border-gray-900 shadow-[4px_4px_0_0_#111] flex items-center justify-center transition-all duration-300 ${
          showFab ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
};

export default JobListing;