import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, ArrowLeft, CreditCard, CheckCircle2, AlertTriangle, Film, MapPin } from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer.jsx';
import { bookingsAPI, paymentsAPI } from '../services/api.js';

export default function BookingSummaryPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NET_BANKING'
  const [errorMsg, setErrorMsg] = useState('');
  const [idempotencyKey] = useState(() => `idemp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);

  useEffect(() => {
    async function loadBooking() {
      setLoading(true);
      try {
        const res = await bookingsAPI.getById(bookingId);
        if (res.success && res.data) {
          // If already paid, redirect to ticket directly
          if (res.data.bookingStatus === 'CONFIRMED') {
            navigate(`/ticket-success/${res.data._id}`, { replace: true });
            return;
          }
          setBooking(res.data);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Unable to load booking details');
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId, navigate]);

  const handlePaymentConfirm = async () => {
    setPaying(true);
    setErrorMsg('');

    try {
      // 1. Create Razorpay Order
      const orderRes = await paymentsAPI.createOrder({ bookingId });
      const orderData = orderRes.data;

      // 2. Simulated / Razorpay Verification Flow
      const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
      const mockSignature = 'valid_sandbox_signature';

      const verifyRes = await paymentsAPI.verify({
        bookingId,
        orderId: orderData.orderId,
        paymentId: mockPaymentId,
        signature: mockSignature,
        idempotencyKey,
      });

      if (verifyRes.success) {
        navigate(`/ticket-success/${bookingId}`, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleExpired = () => {
    setErrorMsg('Your 5-minute reservation window has expired. Seats have been released.');
    setTimeout(() => {
      navigate('/movies');
    }, 2500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Booking Not Found</h2>
        <button
          onClick={() => navigate('/movies')}
          className="text-sm text-violet-400 hover:underline"
        >
          Browse Movies
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-display text-white">
              Booking Confirmation & Checkout
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review your seats and complete payment before lock expiration
            </p>
          </div>
        </div>

        {booking.lockExpiresAt && (
          <CountdownTimer targetDate={booking.lockExpiresAt} onExpire={handleExpired} />
        )}
      </div>

      {errorMsg && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Movie & Cinema Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Movie card */}
          <div className="p-6 rounded-2xl bg-[#121622] border border-slate-800/80 flex items-start gap-4">
            {booking.movie?.poster && (
              <img
                src={booking.movie.poster}
                alt={booking.movie.title}
                referrerPolicy="no-referrer"
                className="w-20 h-28 object-cover rounded-xl border border-slate-700 shrink-0"
              />
            )}
            <div>
              <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">
                {booking.show?.format || 'IMAX'} · {booking.movie?.language}
              </div>
              <h2 className="text-xl font-bold font-display text-white">
                {booking.movie?.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{booking.cinema?.name}, {booking.cinema?.city}</span>
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="font-semibold text-white">Screen:</span> {booking.screen?.name}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-2xl bg-[#121622] border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-white">Select Payment Mode</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'UPI', label: 'UPI / QR Code' },
                { id: 'CARD', label: 'Debit / Credit Card' },
                { id: 'NET_BANKING', label: 'Net Banking' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                    paymentMethod === m.id
                      ? 'bg-violet-600/20 border-violet-500 text-white shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-800/30 text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
              <span>
                Razorpay 256-Bit SSL Sandbox Active · Instant verification with zero double-charge guarantee.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Price Breakdown Summary */}
        <div className="p-6 rounded-2xl bg-[#121622] border border-slate-800/80 h-fit space-y-5">
          <h3 className="text-sm font-semibold text-white pb-3 border-b border-slate-800">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            {/* Seats line */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">
                  Seats: {booking.seats?.map(s => s.seatId).join(', ')}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {booking.seats?.length} {booking.seats?.length === 1 ? 'ticket' : 'tickets'}
                </span>
              </div>
              <span className="font-mono font-semibold text-white">
                ₹{booking.ticketAmount}
              </span>
            </div>

            {/* Convenience Fee */}
            <div className="flex items-center justify-between text-slate-400">
              <span>Convenience Fee (₹30/seat)</span>
              <span className="font-mono">₹{booking.convenienceFee}</span>
            </div>

            {/* GST */}
            <div className="flex items-center justify-between text-slate-400">
              <span>Integrated GST (18%)</span>
              <span className="font-mono">₹{booking.taxes}</span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base font-bold text-white">
              <span>Total Payable</span>
              <span className="font-mono text-violet-300">₹{booking.totalAmount}</span>
            </div>
          </div>

          <button
            onClick={handlePaymentConfirm}
            disabled={paying}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            <span>{paying ? 'Authorizing Payment...' : `Pay ₹${booking.totalAmount}`}</span>
          </button>

          <p className="text-[11px] text-slate-500 text-center leading-tight">
            By clicking Pay, you agree to Cinevo terms and conditions. Cancellation available up to 2 hours before showtime.
          </p>
        </div>
      </div>
    </div>
  );
}
