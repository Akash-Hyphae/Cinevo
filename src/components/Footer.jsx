import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/Logo.jsx';
import { ShieldCheck, Lock, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#07090d] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <Logo size={26} showText={true} />
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Next-generation cinema ticketing and seat reservation platform with atomic lock guarantees, real-time sync, and digital ticketing.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Cinematic Network</h4>
            <ul className="space-y-2">
              <li><Link to="/movies" className="hover:text-violet-400 transition-colors">Now Showing</Link></li>
              <li><Link to="/movies?status=UPCOMING" className="hover:text-violet-400 transition-colors">Coming Soon</Link></li>
              <li><Link to="/cinemas" className="hover:text-violet-400 transition-colors">IMAX & 4DX Hubs</Link></li>
              <li><Link to="/cinemas" className="hover:text-violet-400 transition-colors">Dolby Atmos Theatres</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Seat Safety Invariants</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-slate-400">
                <Lock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>5-Minute Atomic Lock Guarantee</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Double-Booking Mutex</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Idempotent Payment Verification</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Verification Tools</h4>
            <ul className="space-y-2">
              <li><Link to="/concurrency-test" className="hover:text-violet-400 transition-colors">Race Condition Simulator</Link></li>
              <li><Link to="/my-bookings" className="hover:text-violet-400 transition-colors">Ticket QR Validation</Link></li>
              <li><Link to="/admin" className="hover:text-violet-400 transition-colors">Operations Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>© {new Date().getFullYear()} Cinevo Cinema Platforms Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Mumbai</span>
            <span aria-hidden="true">·</span>
            <span>Delhi-NCR</span>
            <span aria-hidden="true">·</span>
            <span>Bengaluru</span>
            <span aria-hidden="true">·</span>
            <span>Hyderabad</span>
            <span aria-hidden="true">·</span>
            <span>Chennai</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
