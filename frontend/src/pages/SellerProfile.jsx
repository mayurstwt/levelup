import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StarDisplay = ({ value }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={`text-sm ${s <= Math.round(value) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
    ))}
  </div>
);

const SellerProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${backendUrl}/users/${id}/profile`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-400 rounded p-6 text-red-700">{error || 'Profile not found'}</div>
      </div>
    );
  }

  const { user, completedJobs, reviews } = data;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/jobs" className="hover:text-blue-600">Marketplace</Link>
          <span>/</span>
          <span className="text-gray-700">{user.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-6">

          {/* ── LEFT: Profile Card ── */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white border-2 border-gray-900 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] p-6 sticky top-20">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-3xl mb-3">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <h1 className="font-black text-gray-900 text-xl">{user.name}</h1>
                <span className={`mt-1 text-xs font-black px-2.5 py-0.5 rounded uppercase ${
                  user.role === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>{user.role}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: 'Rating', value: user.rating > 0 ? user.rating.toFixed(1) : '—' },
                  { label: 'Reviews', value: reviews.length },
                  { label: 'Jobs', value: completedJobs },
                ].map(s => (
                  <div key={s.label} className="border border-gray-100 rounded p-2 text-center">
                    <p className="font-black text-gray-900 text-base">{s.value}</p>
                    <p className="text-gray-400 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Rating stars */}
              {user.rating > 0 && (
                <div className="flex justify-center mb-4">
                  <StarDisplay value={user.rating} />
                </div>
              )}

              {/* Bio */}
              {user.bio && (
                <div className="mb-4">
                  <p className="text-xs font-black text-gray-700 uppercase tracking-wide mb-1">About</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Games */}
              {user.games?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-black text-gray-700 uppercase tracking-wide mb-2">Specializes In</p>
                  <div className="flex flex-wrap gap-1">
                    {user.games.map(g => (
                      <span key={g} className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rate */}
              {user.rate > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500">Hourly Rate</p>
                  <p className="font-black text-gray-900 text-lg">{user.rate} <span className="text-blue-400 text-sm">◈</span></p>
                </div>
              )}
            </div>
          </aside>

          {/* ── RIGHT: Reviews ── */}
          <main className="flex-1 min-w-0">
            <div className="bg-white border-2 border-gray-200 rounded p-6">
              <h2 className="font-black text-gray-900 text-base uppercase tracking-wide mb-5">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-gray-400 font-semibold">No reviews yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Reviews appear once jobs are completed.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-black text-gray-700">
                            {r.reviewerId?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-sm">{r.reviewerId?.name}</p>
                            <p className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <StarDisplay value={r.rating} />
                      </div>
                      {r.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed italic pl-10">"{r.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
