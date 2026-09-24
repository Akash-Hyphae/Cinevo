import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI } from '../services/api.js';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    register,
    verifyEmail,
    quickLoginDemoUser,
    quickLoginDemoAdmin,
    unverifiedEmail,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [latestToken, setLatestToken] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.message);
        }
      } else if (authModalMode === 'register') {
        const res = await register(name, email, password);
        if (res.success) {
          setLatestToken(res.verificationToken || '');
          setSuccessMsg('Account created! Please verify your email.');
        } else {
          setErrorMsg(res.message);
        }
      } else if (authModalMode === 'forgot') {
        const res = await authAPI.forgotPassword(email);
        if (res.success) {
          setSuccessMsg('Password reset link sent to your email.');
          setLatestToken(res.resetToken || '');
        } else {
          setErrorMsg(res.message);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDevVerify = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let tokenToUse = latestToken;
      if (!tokenToUse) {
        // Fetch mailbox
        const mailRes = await authAPI.getMailbox();
        if (mailRes.success && mailRes.data?.length) {
          const matching = mailRes.data.find(m => m.to === (unverifiedEmail || email));
          tokenToUse = matching ? matching.token : mailRes.data[0].token;
        }
      }

      if (!tokenToUse) {
        throw new Error('No pending verification token found.');
      }

      const res = await verifyEmail(tokenToUse);
      if (res.success) {
        setSuccessMsg('Email verified! You are now logged in.');
        setTimeout(() => closeAuthModal(), 1000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-md rounded-2xl glass-panel-elevated p-6 sm:p-8 border border-slate-800 text-slate-100 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* VERIFICATION NOTICE VIEW */}
        {authModalMode === 'verify_notice' ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-4">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              We sent a secure verification link to <br />
              <span className="text-violet-300 font-medium">{unverifiedEmail || email}</span>
            </p>

            <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/40 text-left mb-6">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Development Sandbox:</span> You can verify instantly right here without leaving the application.
                </div>
              </div>
              <button
                onClick={handleInstantDevVerify}
                disabled={loading}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Simulate Clicking Verification Link'}</span>
              </button>
            </div>

            {errorMsg && <p className="text-xs text-red-400 mb-4">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-emerald-400 mb-4">{successMsg}</p>}

            <button
              onClick={() => setAuthModalMode('login')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold tracking-wider text-violet-400 uppercase">Cinevo Cinema Account</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {authModalMode === 'login' && 'Welcome Back'}
                {authModalMode === 'register' && 'Join Cinevo Premiere'}
                {authModalMode === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {authModalMode === 'login' && 'Access your reserved seats, tickets and exclusive premieres.'}
                {authModalMode === 'register' && 'Reserve seats with atomic locks, live countdowns & instant tickets.'}
                {authModalMode === 'forgot' && 'Enter your email to receive a recovery token.'}
              </p>
            </div>

            {/* Quick Demo Logins Bar */}
            {authModalMode === 'login' && (
              <div className="mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                  <span>Quick Demo Access:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={quickLoginDemoUser}
                    className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700/60 transition-colors"
                  >
                    Demo User
                  </button>
                  <button
                    type="button"
                    onClick={quickLoginDemoAdmin}
                    className="py-1.5 px-2 rounded-lg bg-violet-900/40 hover:bg-violet-800/50 text-xs font-medium text-violet-200 border border-violet-700/50 transition-colors"
                  >
                    Demo Admin
                  </button>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs">
                {successMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authModalMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Hayes"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@cinevo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {authModalMode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    {authModalMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setAuthModalMode('forgot')}
                        className="text-xs text-violet-400 hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>
                  {loading
                    ? 'Processing...'
                    : authModalMode === 'login'
                    ? 'Sign In to Cinevo'
                    : authModalMode === 'register'
                    ? 'Create Account'
                    : 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Toggle Modes */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              {authModalMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthModalMode('register')}
                    className="text-violet-400 font-semibold hover:underline ml-1"
                  >
                    Register now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthModalMode('login')}
                    className="text-violet-400 font-semibold hover:underline ml-1"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
