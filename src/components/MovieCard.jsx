import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Sparkles } from 'lucide-react';

export default function MovieCard({ movie }) {
  if (!movie) return null;

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#121622] border border-slate-800/80 hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-950/20">
      {/* Poster Media Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.poster}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback gradient if external image fails
            e.target.style.display = 'none';
          }}
        />

        {/* Rating overlay */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>

        {/* Certificate */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300">
          {movie.certificate}
        </div>

        {/* Formats banner at bottom of poster */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#121622] via-[#121622]/80 to-transparent flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-medium text-violet-300">
            {movie.formats?.join(' · ') || '2D · IMAX'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{movie.duration}m</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-semibold text-base text-white group-hover:text-violet-300 transition-colors line-clamp-1">
            {movie.title}
          </h3>

          {/* Unboxed clean metadata (Anti-slop zero pill discipline) */}
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span>{movie.language}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{movie.genres?.slice(0, 2).join(', ')}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <Link
            to={`/movies/${movie._id}`}
            className="w-full py-2 px-3 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-semibold text-center transition-all"
          >
            {movie.status === 'UPCOMING' ? 'View Details' : 'Book Tickets'}
          </Link>
        </div>
      </div>
    </div>
  );
}
