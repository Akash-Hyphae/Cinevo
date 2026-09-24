import React from 'react';

export default function Logo({ size = 32, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-500 shadow-lg shadow-purple-900/30 shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 text-white"
        >
          {/* Ticket Body with Notches */}
          <path
            d="M5 10C5 8.89543 5.89543 8 7 8H25C26.1046 8 27 8.89543 27 10V14C25.3431 14 24 15.3431 24 17C24 18.6569 25.3431 20 27 20V24C27 25.1046 26.1046 26 25 26H7C5.89543 26 5 25.1046 5 24V20C6.65685 20 8 18.6569 8 17C8 15.3431 6.65685 14 5 14V10Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Centered Play Triangle */}
          <path
            d="M13.5 13L19.5 17L13.5 21V13Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {showText && (
        <span className="font-display font-bold text-xl tracking-tight text-white flex items-center">
          CINE<span className="text-violet-400">VO</span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 ml-0.5 animate-pulse" />
        </span>
      )}
    </div>
  );
}
