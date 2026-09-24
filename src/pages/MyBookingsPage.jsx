import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, AlertCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { bookingsAPI } from '../services/api.js';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CONFIRMED' | 'CANCELLED'
  const [cancellingId, setCancellingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.warn('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Your seats will be released back to the auditorium.')) {
      return;
    }

    setCancellingId(bookingId);
    setFeedbackMsg('');

    try {
      const res = await bookingsAPI.cancel(bookingId);
      if (res.success) {
        setFeedbackMsg('Booking cancelled successfully and seats released.');
        await loadBookings();
      }
    } catch (err) {
      setFeedbackMsg(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    return b.bookingStatus === filter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">
            My Bookings & Tickets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your admission passes, seat assignments, and reservation history
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          {['ALL', 'CONFIRMED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === tab
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {feedbackMsg && (
        <div className="mt-6 p-4 rounded-xl bg-violet-950/40 border border-violet-800/60 text-violet-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl bg-slate-900/40 border border-slate-800 mt-8">
          <Ticket className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You don't have any {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings yet. Discover the latest movies and reserve your seats.
          </p>
          <div className="mt-6">
            <Link
              to="/movies"
              className="py-2.5 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
            >
              Browse Movies
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {filteredBookings.map((b) => {
            const isConfirmed = b.bookingStatus === 'CONFIRMED';
            const isCancelled = b.bookingStatus === 'CANCELLED';

            const formattedDate = b.showStartTime
              ? new Date(b.showStartTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Date';

            const formattedTime = b.showStartTime
              ? new Date(b.showStartTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'Time';

            return (
              <div
                key={b._id}
                className="p-6 rounded-2xl bg-[#121622] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  {b.moviePoster && (
                    <img
                      src={b.moviePoster}
                      alt={b.movieTitle}
                      referrerPolicy="no-referrer"
                      className="w-16 h-24 object-cover rounded-xl border border-slate-700 shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        isConfirmed
                          ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400'
                          : 'bg-red-950/60 border border-red-800/60 text-red-400'
                      }`}>
                        {b.bookingStatus}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Ref: {b.bookingReference}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-display text-white">
                      {b.movieTitle}
                    </h3>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                      <span>{b.cinemaName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{b.screenName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-violet-400">{b.showFormat}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-violet-400" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right block: Seats, Total & Actions */}
                <div className="flex flex-col md:items-end justify-between self-stretch md:self-auto gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
                  <div className="md:text-right">
                    <div className="text-xs text-slate-400">Reserved Seats</div>
                    <div className="text-base font-bold font-mono text-violet-300">
                      {b.seats?.map(s => s.seatId).join(', ')}
                    </div>
                    <div className="text-sm font-bold font-mono text-white mt-0.5">
                      Total: ₹{b.totalAmount}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {isConfirmed && (
                      <>
                        <Link
                          to={`/ticket-success/${b._id}`}
                          className="py-2 px-3.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>View Ticket</span>
                        </Link>
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancellingId === b._id}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-800/60 text-xs transition-colors"
                        >
                          {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
