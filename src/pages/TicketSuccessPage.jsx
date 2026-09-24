import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, ArrowLeft, Home } from 'lucide-react';
import TicketCard from '../components/TicketCard.jsx';
import { bookingsAPI } from '../services/api.js';

export default function TicketSuccessPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await bookingsAPI.getById(bookingId);
        if (res.success && res.data) {
          setBooking(res.data);
          // Trigger celebration confetti
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#8b5cf6', '#a855f7', '#ec4899', '#38bdf8'],
            });
          } catch (e) {
            console.warn('Confetti error:', e);
          }
        }
      } catch (err) {
        console.warn('Failed to load confirmed booking:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Booking Not Found</h2>
        <Link to="/" className="text-sm text-violet-400 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Success banner */}
      <div className="text-center mb-8 print:hidden">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
          Booking Confirmed!
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Your seats have been permanently secured in the theatre database. Present your digital ticket QR code at entry.
        </p>
      </div>

      {/* Ticket presentation */}
      <TicketCard booking={booking} />

      {/* Navigation Links */}
      <div className="mt-8 flex items-center justify-center gap-4 print:hidden text-xs">
        <Link
          to="/my-bookings"
          className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
        >
          <Ticket className="w-4 h-4 text-violet-400" />
          <span>View All Bookings</span>
        </Link>
        <Link
          to="/"
          className="py-2.5 px-4 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 flex items-center gap-2 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          <span>Browse More Movies</span>
        </Link>
      </div>
    </div>
  );
}
