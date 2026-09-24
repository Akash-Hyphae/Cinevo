import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('VERIFYING'); // 'VERIFYING' | 'SUCCESS' | 'ERROR'
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function executeVerification() {
      if (!token) {
        setStatus('ERROR');
        setMessage('Missing email verification token in link.');
        setLoading(false);
        return;
      }

      try {
        const res = await verifyEmail(token);
        if (res.success) {
          setStatus('SUCCESS');
          setMessage(res.message || 'Email successfully verified! Welcome to Cinevo Premiere.');
        } else {
          setStatus('ERROR');
          setMessage(res.message || 'Invalid or expired verification token.');
        }
      } catch (err) {
        setStatus('ERROR');
        setMessage(err.message || 'Verification failed. Token may have expired.');
      } finally {
        setLoading(false);
      }
    }

    executeVerification();
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 min-h-screen text-center">
      <div className="p-8 rounded-3xl glass-panel-elevated border border-slate-800 shadow-2xl">
        {loading ? (
          <div>
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">Verifying Your Email...</h2>
            <p className="text-xs text-slate-400 mt-1">
              Communicating with Cinevo authentication servers
            </p>
          </div>
        ) : status === 'SUCCESS' ? (
          <div>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold font-display text-white mb-2">
              Email Verified!
            </h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {message}
            </p>
            <Link
              to="/movies"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30 transition-all"
            >
              <span>Explore Movies & Book Seats</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold font-display text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {message}
            </p>
            <Link
              to="/"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Return to Home</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
