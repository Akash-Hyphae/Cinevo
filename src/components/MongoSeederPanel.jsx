import React, { useState, useEffect } from 'react';
import { Database, Server, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Film, Building, Monitor, Clock, Users, Ticket, ArrowRight, ShieldCheck } from 'lucide-react';
import { adminAPI } from '../services/api.js';

export default function MongoSeederPanel({ onSeeded }) {
  const [mongoStatus, setMongoStatus] = useState(null);
  const [customUri, setCustomUri] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await adminAPI.getMongoStatus();
      if (res.success) {
        setMongoStatus(res.data);
      }
    } catch (err) {
      console.warn('Could not retrieve Mongo status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    setErrorMsg('');
    setSeedResult(null);

    try {
      const res = await adminAPI.seedMongoData({
        mongoUri: customUri.trim() || undefined,
      });

      if (res.success) {
        setSeedResult(res);
        fetchStatus();
        if (onSeeded) {
          onSeeded();
        }
      } else {
        setErrorMsg(res.message || 'Failed to seed MongoDB test data');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while uploading test data to MongoDB');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-[#121622] border border-violet-800/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-violet-600/30 text-violet-300 border border-violet-500/40">
                <Database className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-violet-300">
                MongoDB Cluster Data Engine
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              Huge Test Data Uploader & Seeder
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Populate your MongoDB database with massive real-world test data: 20+ blockbuster theatrical releases, 15 multiplexes across 7 metro cities, 45 screens with 8,640+ interactive tiered seats, 500+ showtimes, and 100+ confirmed bookings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {seeding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Seeding Collections...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Upload Huge Test Data Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MongoDB Connection Status Indicator */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Connection Status:</span>
            {mongoStatus?.isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected to MongoDB Cluster ({mongoStatus.databaseName || 'cinevo'})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/50 border border-amber-700/50 text-amber-300 font-medium text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                In-Memory Datastore Active (Ready to sync to MongoDB)
              </span>
            )}
          </div>

          <button
            onClick={fetchStatus}
            disabled={loadingStatus}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loadingStatus ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Seed Summary Card */}
      {seedResult && seedResult.summary && (
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-700/40 text-slate-200 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>{seedResult.message}</span>
            </div>
            <span className="text-[11px] font-mono bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
              Verified Complete
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {[
              { label: 'Movies Inserted', value: seedResult.summary.moviesCount, icon: Film },
              { label: 'Cinemas Seeded', value: seedResult.summary.cinemasCount, icon: Building },
              { label: 'Screens Created', value: seedResult.summary.screensCount, icon: Monitor },
              { label: 'Shows Scheduled', value: seedResult.summary.showsCount, icon: Clock },
              { label: 'Test Users', value: seedResult.summary.usersCount, icon: Users },
              { label: 'Bookings Added', value: seedResult.summary.bookingsCount, icon: Ticket },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-3 rounded-xl bg-[#090b10]/80 border border-emerald-900/40 text-center">
                  <Icon className="w-4 h-4 text-emerald-400 mx-auto mb-1 opacity-80" />
                  <div className="text-lg font-bold font-mono text-white">{item.value}</div>
                  <div className="text-[10px] text-slate-400">{item.label}</div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-emerald-300/80 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Total Tiered Seats Configured: {seedResult.summary.totalSeatsConfigured.toLocaleString()} (Regular, Premium, and Recliner layouts).
            </span>
          </div>
        </div>
      )}

      {/* Dataset Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs uppercase tracking-wider">
            <Film className="w-4 h-4" />
            <span>20+ Theatrical Movies</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Includes Dune Part Two, Oppenheimer, Interstellar, Cyberpunk, Kalki 2898 AD, Gladiator II, Deadpool & Wolverine, Demon Slayer, Spider-Man, and more with full casts, 4K posters, backdrops, runtimes, and certifications (U, UA, A).
          </p>
          <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-400">
            <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">IMAX 70mm</span>
            <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">4DX Motion</span>
            <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">3D</span>
            <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">2D</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>15 Cinemas & 45 Screens</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multiplexes spread across Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Chennai, Pune, and Kolkata with Dolby Atmos, IMAX Dual Laser, and VIP Recliner Lounges.
          </p>
          <div className="text-[11px] text-slate-400 font-mono">
            8,640+ Individual Seats with Row/Column indexing & category multipliers.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121622] border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>500+ Shows & 100+ Bookings</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Complete schedule for Morning, Matinee, Evening, and Prime-time slots across 7 consecutive days, plus 100 realistic past bookings with revenue analytics and digital passes.
          </p>
          <div className="text-[11px] text-slate-400 font-mono">
            Full double-click idempotency and dynamic seat state tracking.
          </div>
        </div>
      </div>

      {/* Optional Custom MongoDB URI Configuration */}
      <div className="p-6 rounded-2xl bg-[#121622] border border-slate-800/80 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-violet-400" />
            <span>Custom MongoDB Cluster URI (Optional)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            If you have a MongoDB Atlas connection string, you can paste it below to target your specific cloud cluster directly. If left blank, the server will use <code className="text-violet-300 font-mono">process.env.MONGO_URI</code> or populate the active production datastore.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={customUri}
            onChange={(e) => setCustomUri(e.target.value)}
            placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/cinevo?retryWrites=true&w=majority"
            className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
          />
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="py-2.5 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{seeding ? 'Processing...' : 'Upload to Target URI'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="text-violet-300 font-semibold flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            <span>MongoDB Atlas Network Access Tip:</span>
          </div>
          <p>
            If using MongoDB Atlas, make sure to add <code className="text-emerald-400 font-mono bg-slate-950 px-1 py-0.5 rounded">0.0.0.0/0</code> to your Atlas <strong>Network Access &gt; IP Access List</strong> (Allow Access from Anywhere), otherwise cloud hosts cannot connect to your cluster.
          </p>
        </div>

        <div className="text-[11px] text-slate-500">
          Demo Admin credentials: <strong className="text-slate-300">admin@cinevo.com</strong> / <strong className="text-slate-300">AdminSecret123!</strong> (Role: ADMIN)
        </div>
      </div>
    </div>
  );
}
