import React from 'react';
import { Armchair, Sparkles } from 'lucide-react';

export default function SeatGrid({
  seats = [],
  selectedSeats = [],
  onToggleSeat,
  pricing = {},
  disabled = false,
}) {
  // Group seats by row
  const rowsMap = new Map();
  seats.forEach((seat) => {
    if (!rowsMap.has(seat.row)) {
      rowsMap.set(seat.row, []);
    }
    rowsMap.get(seat.row).push(seat);
  });

  const rowLetters = Array.from(rowsMap.keys()).sort();

  // Helper to determine seat category title
  const getCategoryTitle = (row) => {
    if (row === 'A') return `RECLINER LOUNGE — ₹${pricing.RECLINER || 550}`;
    if (row === 'B') return `PREMIUM PRIME — ₹${pricing.PREMIUM || 350}`;
    if (row === 'E') return `CLASSIC REGULAR — ₹${pricing.REGULAR || 220}`;
    return null;
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-6">
      {/* Curved Screen Presentation */}
      <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
        <div className="w-full cinema-screen-curve" />
        <div className="text-[11px] uppercase tracking-widest text-violet-400/80 font-mono mt-3">
          All eyes this way · Cinema Projection Screen
        </div>
      </div>

      {/* Seat Rows Matrix */}
      <div className="space-y-6 w-full max-w-3xl overflow-x-auto pb-4 px-2">
        {rowLetters.map((rowLetter) => {
          const rowSeats = rowsMap.get(rowLetter) || [];
          const categoryHeader = getCategoryTitle(rowLetter);

          return (
            <div key={rowLetter} className="flex flex-col items-center">
              {categoryHeader && (
                <div className="text-xs font-semibold text-slate-400 mb-3 tracking-wider uppercase flex items-center gap-2">
                  <span>{categoryHeader}</span>
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Row label left */}
                <span className="w-5 text-center text-xs font-bold text-slate-500 font-mono">
                  {rowLetter}
                </span>

                {/* Seats row */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rowSeats.map((seat, idx) => {
                    const isSelected = selectedSeats.includes(seat.seatId) || seat.status === 'SELECTED_BY_ME';
                    const isBooked = seat.status === 'BOOKED';
                    const isLocked = seat.status === 'LOCKED' && !isSelected;

                    // Split aisle after middle column
                    const isAisleSplit = idx === Math.floor(rowSeats.length / 2) - 1;

                    // Button styling depending on state
                    let seatClass = 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-violet-500 hover:text-white cursor-pointer';

                    if (isBooked) {
                      seatClass = 'bg-slate-900/40 text-slate-700 border-slate-800/40 cursor-not-allowed opacity-40';
                    } else if (isLocked) {
                      seatClass = 'bg-amber-950/50 text-amber-500 border-amber-600/50 cursor-not-allowed';
                    } else if (isSelected) {
                      seatClass = 'bg-gradient-to-tr from-violet-600 to-purple-500 text-white border-violet-400 shadow-md shadow-violet-900/40 ring-2 ring-violet-400/40';
                    }

                    const isRecliner = seat.category === 'RECLINER';

                    return (
                      <React.Fragment key={seat.seatId}>
                        <button
                          type="button"
                          disabled={disabled || isBooked || isLocked}
                          onClick={() => onToggleSeat(seat.seatId)}
                          title={`${seat.seatId} (${seat.category}) - ₹${seat.price} ${
                            isBooked ? '[Booked]' : isLocked ? '[Reserved by another customer]' : ''
                          }`}
                          className={`relative flex items-center justify-center rounded-md border text-[11px] font-mono transition-all duration-150 ${
                            isRecliner ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-7 h-7 sm:w-8 sm:h-8'
                          } ${seatClass}`}
                        >
                          <span>{seat.column}</span>
                        </button>

                        {/* Visual Aisle space */}
                        {isAisleSplit && <div className="w-3 sm:w-6" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row label right */}
                <span className="w-5 text-center text-xs font-bold text-slate-500 font-mono">
                  {rowLetter}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seat State Legend */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 border-t border-slate-800/80 pt-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-slate-800 border border-slate-700" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-violet-600 to-purple-500 border border-violet-400 shadow-sm" />
          <span className="text-violet-300 font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-amber-950/60 border border-amber-600/60 text-amber-500 text-[10px] flex items-center justify-center font-mono">
            !
          </div>
          <span className="text-amber-300">Locked (5 min)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-slate-900/40 border border-slate-800/40 opacity-40" />
          <span className="text-slate-500">Booked</span>
        </div>
      </div>
    </div>
  );
}
