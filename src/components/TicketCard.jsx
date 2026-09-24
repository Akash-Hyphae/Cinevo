import React from 'react';
import { Printer, Download, Calendar, Clock, MapPin, Film, ShieldCheck } from 'lucide-react';
import Logo from '../assets/Logo.jsx';

export default function TicketCard({ booking }) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = booking.show?.startTime
    ? new Date(booking.show.startTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date';

  const formattedTime = booking.show?.startTime
    ? new Date(booking.show.startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'Time';

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Action buttons top */}
      <div className="flex items-center justify-end gap-3 mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-2 border border-slate-700 transition-colors shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-violet-400" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Main Ticket Shell */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#181c2b] to-[#0f121d] border border-violet-500/30 text-white shadow-2xl shadow-purple-950/40 print:border-slate-800">
        {/* Ticket Header */}
        <div className="p-6 border-b border-slate-800/80 bg-violet-950/30 flex items-center justify-between">
          <Logo size={24} showText={true} />
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-violet-300">
              Admission Pass
            </span>
            <div className="text-xs font-mono font-bold text-white tracking-widest">
              {booking.bookingReference}
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-5">
          {/* Movie Title & Format */}
          <div className="flex items-start gap-4">
            {booking.movie?.poster && (
              <img
                src={booking.movie.poster}
                alt={booking.movie.title}
                referrerPolicy="no-referrer"
                className="w-16 h-24 object-cover rounded-xl border border-slate-700 shadow-md shrink-0"
              />
            )}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mb-1">
                <span>{booking.show?.format || 'IMAX LASER'}</span>
                <span aria-hidden="true">·</span>
                <span>{booking.movie?.certificate || 'UA'}</span>
                <span aria-hidden="true">·</span>
                <span>{booking.movie?.language || 'English'}</span>
              </div>
              <h3 className="text-xl font-display font-bold text-white leading-tight">
                {booking.movie?.title || 'Selected Movie'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-slate-500" />
                <span>{booking.screen?.name || 'Screen 1'}</span>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-black/40 border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Date & Time</span>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                <span>{formattedDate}</span>
              </div>
              <div className="text-slate-300 font-mono text-[11px] mt-0.5 ml-5">
                {formattedTime}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Reserved Seats</span>
              <div className="font-bold text-base text-violet-300 font-mono">
                {booking.seats?.map(s => s.seatId).join(', ') || 'Seats'}
              </div>
              <div className="text-[11px] text-slate-400">
                {booking.seats?.length} {booking.seats?.length === 1 ? 'Ticket' : 'Tickets'}
              </div>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-800/80">
              <span className="text-slate-500 block mb-1">Cinema Venue</span>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="truncate">{booking.cinema?.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 ml-5 truncate">
                {booking.cinema?.address}
              </p>
            </div>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="relative flex items-center justify-between px-2 py-1">
          <div className="w-6 h-6 rounded-full bg-[#090b10] -ml-3 border-r border-violet-500/30" />
          <div className="flex-1 border-b-2 border-dashed border-slate-800 mx-2" />
          <div className="w-6 h-6 rounded-full bg-[#090b10] -mr-3 border-l border-violet-500/30" />
        </div>

        {/* Stub & QR Code Entry */}
        <div className="p-6 bg-black/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Payment Verified & Confirmed</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Txn: {booking.paymentId || 'pay_verified_instant'}
            </div>
            <div className="text-sm font-bold text-white font-mono">
              Total Paid: ₹{booking.totalAmount}
            </div>
            <p className="text-[11px] text-slate-500 max-w-[200px]">
              Scan QR code at the cinema turnstile for instant digital entry.
            </p>
          </div>

          {/* QR Code Graphic */}
          <div className="p-2 rounded-2xl bg-white shadow-lg shrink-0">
            {booking.qrCode ? (
              <img
                src={booking.qrCode}
                alt="Ticket QR Code"
                className="w-28 h-28 object-contain"
              />
            ) : (
              <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-slate-800 text-xs font-mono">
                QR CODE
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
