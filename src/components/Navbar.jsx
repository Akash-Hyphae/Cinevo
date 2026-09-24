import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, User, LogOut, Shield, Zap, Ticket } from 'lucide-react';
import Logo from '../assets/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCity } from '../context/CityContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  const { cityName, openCityModal } = useCity();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Movies', path: '/movies' },
    { label: 'Cinemas', path: '/cinemas' },
    { label: 'My Bookings', path: '/my-bookings', authRequired: true },
    { label: 'Race Test', path: '/concurrency-test' },
  ];

  if (isAdmin) {
    navLinks.push({ label: 'Admin', path: '/admin' });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090b10]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand element */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Logo size={28} showText={true} />
        </Link>

        {/* Zone 2: 4-6 Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            if (link.authRequired && !isAuthenticated) return null;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-violet-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 Primary actions (City + Auth) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* City Selector Button */}
          <button
            onClick={openCityModal}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-violet-400" />
            <span className="max-w-[85px] truncate">{cityName}</span>
          </button>

          {/* User Profile or Sign In */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-violet-950/40 border border-violet-800/40 text-xs font-medium text-violet-200 hover:bg-violet-900/50 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-violet-400" />
                <span className="max-w-[100px] truncate">{user?.name}</span>
                {isAdmin && (
                  <span className="text-[10px] bg-violet-700/80 px-1 rounded text-white font-mono">
                    ADM
                  </span>
                )}
              </button>

              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl glass-panel-elevated py-1 border border-slate-800 text-xs text-slate-200 shadow-xl z-50 animate-fade-in"
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/my-bookings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors"
                  >
                    <Ticket className="w-3.5 h-3.5 text-violet-400" />
                    <span>My Bookings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800/60 text-violet-300 hover:text-violet-200 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-violet-400" />
                      <span>Admin Console</span>
                    </Link>
                  )}

                  <Link
                    to="/concurrency-test"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Seat Lock Test Suite</span>
                  </Link>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="py-1.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium text-xs shadow-sm shadow-purple-900/30 transition-all whitespace-nowrap"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
