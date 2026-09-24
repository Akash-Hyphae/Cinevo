import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, AlertTriangle, ShieldCheck, Sparkles, Film, MapPin } from 'lucide-react';
import SeatGrid from '../components/SeatGrid.jsx';
import CountdownTimer from '../components/CountdownTimer.jsx';
import { showsAPI, bookingsAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal, user } = useAuth();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [pricing, setPricing] = useState({});
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lockingInProgress, setLockingInProgress] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Fetch seat status
  const fetchSeatState = useCallback(async () => {
    try {
      const res = await showsAPI.getSeats(showId);
      if (res.success && res.data) {
        setSeats(res.data.seats);
        setPricing(res.data.pricing || {});

        // If server indicates user already has locked seats
        if (res.data.myLockedSeats && res.data.myLockedSeats.length > 0) {
          setSelectedSeatIds(res.data.myLockedSeats);
          setLockExpiresAt(res.data.lockExpiresAt);
        }
      }
    } catch (err) {
      console.warn('Error fetching seat status:', err);
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    async function loadShowAndSeats() {
      setLoading(true);
      try {
        const showRes = await showsAPI.getById(showId);
        if (showRes.success) {
          setShow(showRes.data);
          setPricing(showRes.data.pricing || {});
        }
        await fetchSeatState();
      } catch (err) {
        console.warn('Error loading show details:', err);
      }
    }
    loadShowAndSeats();

    // Auto-poll seat availability every 10 seconds for real-time multiplayer updates
    const pollInterval = setInterval(() => {
      fetchSeatState();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [showId, fetchSeatState]);

  // Handle local seat selection toggle
  const handleToggleSeat = (seatId) => {
    setConflictMessage('');
    setInfoMessage('');

    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        if (prev.length >= 8) {
          setConflictMessage('You can select a maximum of 8 seats per booking.');
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  // Lock seats atomically and proceed to checkout
  const handleLockAndProceed = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (selectedSeatIds.length === 0) {
      setConflictMessage('Please select at least one seat before proceeding.');
      return;
    }

    setLockingInProgress(true);
    setConflictMessage('');

    try {
      // 1. Atomic backend seat lock (5-minute TTL)
      const lockRes = await showsAPI.lockSeats(showId, selectedSeatIds);

      if (lockRes.success) {
        setLockExpiresAt(lockRes.data.lockExpiresAt);

        // 2. Create authoritative booking draft
        const bookingRes = await bookingsAPI.create({
          showId,
          seats: selectedSeatIds.map((id) => ({ seatId: id })),
        });

        if (bookingRes.success && bookingRes.data) {
          navigate(`/booking-summary/${bookingRes.data._id}`);
        }
      }
    } catch (err) {
      // Handle 409 Conflict gracefully
      if (err.status === 409) {
        setConflictMessage(
          err.message || 'One or more of your selected seats was just reserved by another customer.'
        );
      } else {
        setConflictMessage(err.message || 'Failed to lock seats. Please try again.');
      }
      // Re-sync authoritative seat states
      await fetchSeatState();
    } finally {
      setLockingInProgress(false);
    }
  };

  const handleTimerExpired = () => {
    setLockExpiresAt(null);
    setSelectedSeatIds([]);
    setConflictMessage('Your 5-minute seat reservation has expired. Please select your seats again.');
    fetchSeatState();
  };

  // Calculate local subtotal
  const selectedSeatsData = seats.filter((s) => selectedSeatIds.includes(s.seatId));
  const subtotal = selectedSeatsData.reduce((sum, s) => sum + (s.price || 0), 0);

  const formattedDate = show?.startTime
    ? new Date(show.startTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const formattedTime = show?.startTime
    ? new Date(show.startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  if (loading && !show) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* 1. TOP SHOW HEADER BAR */}
      <div className="border-b border-slate-800/80 bg-[#0c0f17]/95 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-display font-bold text-base text-white flex items-center gap-2">
                <span>{show?.movie?.title || 'Movie'}</span>
                <span className="text-xs font-mono font-semibold text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/40">
                  {show?.format || 'IMAX'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{show?.cinema?.name}</span>
                <span aria-hidden="true">·</span>
                <span>{formattedDate}, {formattedTime}</span>
              </p>
            </div>
          </div>

          {/* Active 5-minute countdown clock */}
          {lockExpiresAt && (
            <CountdownTimer targetDate={lockExpiresAt} onExpire={handleTimerExpired} />
          )}
        </div>
      </div>

      {/* 2. CONFLICT OR ALERT BANNER */}
      {conflictMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-6 animate-fade-in">
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-600/50 text-red-200 text-xs flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-white mb-0.5">Concurrency Alert</span>
              {conflictMessage}
            </div>
          </div>
        </div>
      )}

      {/* 3. AUDITORIUM SEAT SELECTION GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <SeatGrid
          seats={seats}
          selectedSeats={selectedSeatIds}
          onToggleSeat={handleToggleSeat}
          pricing={pricing}
          disabled={lockingInProgress}
        />
      </div>

      {/* 4. FIXED FLOATING CHECKOUT STRIP */}
      {selectedSeatIds.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0c0f17]/95 border-t border-slate-800/90 backdrop-blur-xl shadow-2xl p-4 animate-slide-up">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Selected:</span>
                <span className="font-mono font-bold text-violet-300 text-sm">
                  {selectedSeatIds.join(', ')}
                </span>
                <span className="text-xs text-slate-400">({selectedSeatIds.length} seats)</span>
              </div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                Subtotal: ₹{subtotal}
                <span className="text-[11px] text-slate-400 font-normal ml-2">
                  (+ fees & taxes at checkout)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={lockingInProgress}
                onClick={handleLockAndProceed}
                className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-violet-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {lockingInProgress ? 'Securing 5-Min Lock...' : 'Lock Seats & Proceed'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
