import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown.js';

export default function CountdownTimer({ targetDate, onExpire, className = '' }) {
  const { minutes, seconds, isExpired, totalSeconds } = useCountdown(targetDate, onExpire);

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-medium ${className}`}>
        <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
        <span>Reservation expired. Seats released.</span>
      </div>
    );
  }

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  // Dynamic status color: warning if <= 60 seconds, amber if <= 120 seconds
  const isCritical = totalSeconds <= 60;
  const isWarning = totalSeconds <= 120 && !isCritical;

  const colorClasses = isCritical
    ? 'bg-red-950/60 border-red-600/60 text-red-300 animate-pulse'
    : isWarning
    ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
    : 'bg-violet-950/50 border-violet-800/40 text-violet-300';

  return (
    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border backdrop-blur-md shadow-sm transition-colors ${colorClasses} ${className}`}>
      <Clock className={`w-4 h-4 shrink-0 ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-violet-400'}`} />
      <div className="flex items-center gap-1.5 text-xs font-medium">
        <span className="hidden sm:inline text-slate-300">Seats locked:</span>
        <span className="font-mono font-bold tracking-wider text-sm tabular-nums">
          {formattedMinutes}:{formattedSeconds}
        </span>
      </div>
    </div>
  );
}
