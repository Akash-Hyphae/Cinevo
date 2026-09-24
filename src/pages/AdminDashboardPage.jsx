import React, { useState, useEffect } from 'react';
import { Shield, Plus, Film, Calendar, DollarSign, Users, Ticket, Trash2, Zap, Layers, AlertCircle } from 'lucide-react';
import { adminAPI, moviesAPI, cinemasAPI } from '../services/api.js';
import ConcurrencyTester from '../components/ConcurrencyTester.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'movies' | 'shows' | 'concurrency'
  const [loading, setLoading] = useState(true);

  // Form states for creating a movie
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    poster: '',
    backdrop: '',
    duration: 120,
    language: 'English',
    genres: 'Action, Sci-Fi',
    director: '',
    certificate: 'UA',
    formats: '2D, 3D, IMAX',
  });

  const [movieMsg, setMovieMsg] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await adminAPI.getStats();
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.warn('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setMovieMsg('');
    try {
      const res = await adminAPI.createMovie({
        ...movieForm,
        duration: Number(movieForm.duration),
        genres: movieForm.genres.split(',').map(s => s.trim()),
        formats: movieForm.formats.split(',').map(s => s.trim()),
      });

      if (res.success) {
        setMovieMsg('Movie successfully added to listings!');
        setMovieForm({
          title: '',
          description: '',
          poster: '',
          backdrop: '',
          duration: 120,
          language: 'English',
          genres: 'Action, Sci-Fi',
          director: '',
          certificate: 'UA',
          formats: '2D, 3D, IMAX',
        });
        loadDashboardData();
      }
    } catch (err) {
      setMovieMsg(err.message || 'Failed to add movie');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Shield className="w-12 h-12 text-violet-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-1">Admin Authorization Required</h2>
        <p className="text-xs text-slate-400 mb-6">
          Please login with an administrator account (or use Demo Admin in the login modal) to access the operations console.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold bg-violet-600/30 text-violet-300 px-2 py-0.5 rounded border border-violet-500/40">
              Operations Console
            </span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white">
            Cinevo Master Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time cinema revenue, active seat mutex locks, and manage screening inventories
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          {[
            { id: 'overview', label: 'Analytics' },
            { id: 'movies', label: 'Add Movie' },
            { id: 'concurrency', label: 'Race Test Engine' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              ₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ₹{stats.todayRevenue?.toLocaleString('en-IN') || 0} collected today
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Confirmed Bookings</span>
              <Ticket className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {stats.totalBookings || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {stats.todayBookingsCount || 0} bookings today
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Active Seat Locks</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300">
              {stats.activeLocksCount || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              5-minute temporary reservations in flight
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Movies & Shows</span>
              <Film className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {stats.totalMovies} Movies / {stats.totalShows} Shows
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Across {stats.totalCinemas} premium venues
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="mt-8 space-y-6">
          <div className="p-6 rounded-2xl bg-[#121622] border border-slate-800/80">
            <h3 className="font-display font-bold text-lg text-white mb-4">
              Recent Transaction & Admission Stream
            </h3>

            {stats.recentBookings?.length === 0 ? (
              <p className="text-xs text-slate-400">No bookings recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="pb-3 font-semibold">Ref ID</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Movie & Cinema</th>
                      <th className="pb-3 font-semibold">Seats</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {stats.recentBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-800/40">
                        <td className="py-3 font-bold text-violet-300">{b.bookingReference}</td>
                        <td className="py-3 font-sans">
                          <div className="font-medium text-white">{b.userName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{b.userEmail}</div>
                        </td>
                        <td className="py-3 font-sans">
                          <div className="text-white font-medium">{b.movieTitle}</div>
                          <div className="text-[11px] text-slate-400">{b.cinemaName}</div>
                        </td>
                        <td className="py-3 text-violet-300">{b.seats}</td>
                        <td className="py-3 font-bold text-white">₹{b.totalAmount}</td>
                        <td className="py-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            b.bookingStatus === 'CONFIRMED'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                              : 'bg-red-950/80 text-red-400 border border-red-800/80'
                          }`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ADD MOVIE */}
      {activeTab === 'movies' && (
        <div className="mt-8 max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#121622] border border-slate-800">
          <h3 className="font-display font-bold text-xl text-white mb-2">
            Add New Movie to Catalog
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Enter theatrical details, media posters, and audio/video formats
          </p>

          {movieMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-violet-950/40 border border-violet-800/60 text-violet-200 text-xs">
              {movieMsg}
            </div>
          )}

          <form onSubmit={handleCreateMovie} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Movie Title</label>
              <input
                type="text"
                required
                value={movieForm.title}
                onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                placeholder="e.g. Interstellar Odyssey"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Synopsis / Description</label>
              <textarea
                required
                rows={3}
                value={movieForm.description}
                onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                placeholder="Gripping cinematic narrative..."
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Director</label>
                <input
                  type="text"
                  required
                  value={movieForm.director}
                  onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                  placeholder="Christopher Nolan"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Runtime (minutes)</label>
                <input
                  type="number"
                  required
                  value={movieForm.duration}
                  onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Genres (comma separated)</label>
                <input
                  type="text"
                  value={movieForm.genres}
                  onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Formats (comma separated)</label>
                <input
                  type="text"
                  value={movieForm.formats}
                  onChange={(e) => setMovieForm({ ...movieForm, formats: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all"
            >
              Publish Movie to Theatres
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: CONCURRENCY TEST SUITE */}
      {activeTab === 'concurrency' && (
        <div className="mt-8">
          <ConcurrencyTester />
        </div>
      )}
    </div>
  );
}
