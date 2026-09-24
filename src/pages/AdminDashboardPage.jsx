import React, { useState, useEffect } from 'react';
import { Shield, Plus, Film, Calendar, DollarSign, Users, Ticket, Trash2, Zap, Layers, AlertCircle, Database, Sparkles, Server } from 'lucide-react';
import { adminAPI } from '../services/api.js';
import ConcurrencyTester from '../components/ConcurrencyTester.jsx';
import MongoSeederPanel from '../components/MongoSeederPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminDashboardPage() {
  const { isAdmin, quickLoginDemoAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'mongoSeeder' | 'movies' | 'concurrency'
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

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
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const handleQuickAdminLogin = async () => {
    setLoggingIn(true);
    try {
      const res = await quickLoginDemoAdmin();
      if (res.success) {
        await loadDashboardData();
      }
    } finally {
      setLoggingIn(false);
    }
  };

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
        <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-400 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-2">Admin Authorization Required</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Access the operations console to monitor revenue, live seat mutex locks, manage inventories, and seed huge test datasets directly to MongoDB.
        </p>

        <div className="p-4 rounded-xl bg-[#121622] border border-slate-800 space-y-3">
          <div className="text-xs text-slate-300">
            Click below to instantly authenticate using the pre-configured Demo Admin:
          </div>
          <button
            onClick={handleQuickAdminLogin}
            disabled={loggingIn}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loggingIn ? 'Authenticating Admin...' : 'One-Click Login as Demo Admin'}</span>
          </button>
          <div className="text-[11px] text-slate-500 font-mono">
            Credentials: admin@cinevo.com · AdminSecret123!
          </div>
        </div>
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
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Analytics' },
            { id: 'mongoSeeder', label: 'MongoDB Seeder' },
            { id: 'movies', label: 'Add Movie' },
            { id: 'concurrency', label: 'Race Test Engine' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
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
            <span className="text-[11px] text-slate-500 mt-1 block">
              Confirmed tickets sold
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Active Seat Mutex Locks</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-violet-400">
              {stats.activeLocksCount || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              In-flight 5-minute reservations
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Scheduled Shows</span>
              <Calendar className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {stats.totalShows || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Across {stats.totalCinemas || 0} theatres
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Theatrical Releases</span>
              <Film className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {stats.totalMovies || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Now showing in cinemas
            </span>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MONGO SEEDER */}
      {activeTab === 'mongoSeeder' && (
        <div className="mt-8">
          <MongoSeederPanel onSeeded={loadDashboardData} />
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="mt-8 space-y-6">
          {/* Quick Callout to MongoDB Seeder */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-[#121622] border border-violet-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  MongoDB Test Dataset Seeder Available
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Populate your MongoDB database with 20+ blockbuster movies, 15 cinemas across 7 major metro cities, 45 screens with 8,640+ seats, and 500+ showtimes in one click.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('mongoSeeder')}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open MongoDB Seeder</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-[#121622] border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-white">Recent 10 Theatrical Bookings</h3>
            {stats.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    <tr>
                      <th className="pb-3 font-semibold">Reference</th>
                      <th className="pb-3 font-semibold">Movie</th>
                      <th className="pb-3 font-semibold">Cinema</th>
                      <th className="pb-3 font-semibold">Seats</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {stats.recentBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 text-violet-400 font-semibold">{b.bookingReference}</td>
                        <td className="py-3 font-sans text-white">{b.movieTitle}</td>
                        <td className="py-3 font-sans text-slate-400">{b.cinemaName}</td>
                        <td className="py-3">{b.seats}</td>
                        <td className="py-3 text-emerald-400 font-bold">₹{b.totalAmount}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">No recent bookings found.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ADD MOVIE */}
      {activeTab === 'movies' && (
        <div className="mt-8 max-w-2xl">
          <form onSubmit={handleCreateMovie} className="p-6 rounded-2xl bg-[#121622] border border-slate-800/80 space-y-4 text-xs">
            <h3 className="text-base font-semibold text-white mb-2">Publish New Release</h3>

            {movieMsg && (
              <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-800 text-violet-300">
                {movieMsg}
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">Movie Title</label>
              <input
                type="text"
                required
                value={movieForm.title}
                onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                placeholder="e.g. Dune: Part Two"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Poster Image URL</label>
              <input
                type="url"
                value={movieForm.poster}
                onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Synopsis</label>
              <textarea
                rows={3}
                required
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
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all cursor-pointer"
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
