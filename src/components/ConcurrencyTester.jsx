import React, { useState } from 'react';
import { Zap, ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { adminAPI } from '../services/api.js';

export default function ConcurrencyTester() {
  const [showId, setShowId] = useState('show_2');
  const [seatId, setSeatId] = useState('B6');
  const [userCount, setUserCount] = useState(5);
  const [running, setRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunTest = async () => {
    setRunning(true);
    setError(null);
    setTestResult(null);

    try {
      const res = await adminAPI.testConcurrency({
        showId,
        seatId: seatId.toUpperCase().trim(),
        simulatedUsersCount: Number(userCount),
      });

      if (res.success) {
        setTestResult(res);
      }
    } catch (err) {
      setError(err.message || 'Concurrency test execution failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-violet-500/30 shadow-2xl">
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-600/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Atomic Concurrency Engine</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Race Condition & Seat Lock Verification Suite
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Verifies the backend invariant: When multiple users concurrently attempt to reserve the exact same seat at the exact same millisecond, the transactional mutex allows only ONE user to succeed while rejecting all others with <code className="text-amber-400 font-mono">409 Conflict</code>.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Show ID</label>
          <input
            type="text"
            value={showId}
            onChange={(e) => setShowId(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Seat Number</label>
          <input
            type="text"
            value={seatId}
            onChange={(e) => setSeatId(e.target.value)}
            placeholder="e.g. B6, A2, C4"
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-violet-500 uppercase"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Simultaneous Users</label>
          <select
            value={userCount}
            onChange={(e) => setUserCount(Number(e.target.value))}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
          >
            <option value={2}>2 Users (Classic Simultaneous Click)</option>
            <option value={5}>5 Concurrent Requests</option>
            <option value={10}>10 Concurrent Requests</option>
            <option value={20}>20 High-Pressure Requests</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleRunTest}
          disabled={running}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Firing Concurrent Requests...' : 'Trigger Simultaneous Lock Test'}</span>
        </button>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-violet-400" />
          <span>MongoDB Atomic Operations & Mutex</span>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Test Results Presentation */}
      {testResult && (
        <div className="mt-8 space-y-6 animate-fade-in">
          {/* Summary Metric Card */}
          <div className={`p-6 rounded-2xl border ${
            testResult.testSummary.guaranteeVerified
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/20 border-red-500/40 text-red-300'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {testResult.testSummary.guaranteeVerified ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-base font-bold text-white">
                    {testResult.testSummary.guaranteeVerified
                      ? 'Race Condition Prevented · Zero Collisions Guarantee Maintained'
                      : 'Test Warning · Multiple Locks Granted'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {testResult.testSummary.successfulLocksGranted} user secured the lock ·{' '}
                    {testResult.testSummary.conflictsBlocked} concurrent requests rejected with HTTP 409 Conflict
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-slate-400 block">Total In Flight</span>
                <span className="text-xl font-bold text-white">
                  {testResult.testSummary.totalConcurrentAttempts}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Request Logs */}
          <div className="rounded-2xl bg-black/40 border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40 text-xs font-semibold text-slate-300">
              Simultaneous Transaction Execution Log (Same Millisecond)
            </div>
            <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
              {testResult.detailedLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2.5 flex items-center justify-between gap-4 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{log.user}:</span>
                    <span className="text-slate-200">Attempted Seat {log.seat}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      log.code === 200
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      HTTP {log.code} {log.status}
                    </span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline truncate max-w-xs">
                      {log.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
