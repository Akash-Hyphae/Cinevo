import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, MapPin, Play, Film, Sparkles, ChevronRight } from 'lucide-react';
import { moviesAPI, showsAPI } from '../services/api.js';
import { useCity } from '../context/CityContext.jsx';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCity, cityName } = useCity();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Generate 4 consecutive dates (Today, Tomorrow, Day+2, Day+3)
  const dateOptions = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      index: i,
      raw: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const activeDate = dateOptions[selectedDateIndex];

  useEffect(() => {
    async function loadMovieDetails() {
      setLoading(true);
      try {
        const [movieRes, showsRes] = await Promise.all([
          moviesAPI.getById(id),
          showsAPI.getAll({
            movieId: id,
            city: selectedCity,
            date: activeDate.raw,
          }),
        ]);

        if (movieRes.success) setMovie(movieRes.data);
        if (showsRes.success) setShows(showsRes.data);
      } catch (err) {
        console.warn('Error loading movie details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMovieDetails();
  }, [id, selectedCity, selectedDateIndex]);

  // Group shows by cinema
  const cinemaGroups = new Map();
  shows.forEach((s) => {
    if (!cinemaGroups.has(s.cinemaId)) {
      cinemaGroups.set(s.cinemaId, {
        cinemaId: s.cinemaId,
        cinemaName: s.cinemaName,
        cinemaAddress: s.cinemaAddress,
        facilities: s.facilities || [],
        shows: [],
      });
    }
    cinemaGroups.get(s.cinemaId).shows.push(s);
  });

  const groupedCinemas = Array.from(cinemaGroups.values());

  if (loading && !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Movie Not Found</h2>
        <Link to="/movies" className="text-sm text-violet-400 hover:underline">
          Return to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 1. MOVIE HERO HEADER */}
      <div className="relative w-full overflow-hidden bg-[#0a0c12] border-b border-slate-800">
        {/* Backdrop Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdrop}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Movie Poster */}
            <div className="w-48 sm:w-60 shrink-0 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 mx-auto md:mx-0">
              <img
                src={movie.poster}
                alt={movie.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Movie Information */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold text-violet-400 uppercase tracking-wider">
                <span>{movie.formats?.join(' · ')}</span>
                <span aria-hidden="true">·</span>
                <span>{movie.language}</span>
                <span aria-hidden="true">·</span>
                <span>{movie.certificate}</span>
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white">
                {movie.title}
              </h1>

              {/* Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{movie.rating} / 10</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{movie.duration} mins</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>{movie.genres?.join(', ')}</span>
              </div>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {movie.description}
              </p>

              {/* Cast & Director */}
              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <div>
                  <span className="font-semibold text-white">Director:</span> {movie.director}
                </div>
                <div>
                  <span className="font-semibold text-white">Starring:</span> {movie.cast?.join(', ')}
                </div>
              </div>

              {movie.trailerUrl && (
                <div className="pt-2">
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-2 mx-auto md:mx-0 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SHOWTIMES & CINEMA TIMETABLE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">
              Select Cinema & Showtime
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Available screenings in <span className="text-violet-400 font-semibold">{cityName}</span>
            </p>
          </div>

          {/* Date Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {dateOptions.map((opt) => (
              <button
                key={opt.index}
                onClick={() => setSelectedDateIndex(opt.index)}
                className={`py-2 px-3.5 rounded-xl border text-left transition-all ${
                  selectedDateIndex === opt.index
                    ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-900/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="text-[11px] font-semibold">{opt.dayName}</div>
                <div className="text-xs font-mono">{opt.dateFormatted}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cinemas & Shows List */}
        <div className="mt-8 space-y-6">
          {groupedCinemas.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
              <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-lg font-semibold text-white">No Screenings Available</h3>
              <p className="text-xs text-slate-400 mt-1">
                There are no scheduled shows for this date in {cityName}. Try another date or city.
              </p>
            </div>
          ) : (
            groupedCinemas.map((cinema) => (
              <div
                key={cinema.cinemaId}
                className="p-6 rounded-2xl bg-[#121622] border border-slate-800/80 shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">
                      {cinema.cinemaName}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{cinema.cinemaAddress}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {cinema.facilities?.map((f, i) => (
                      <React.Fragment key={f}>
                        {i > 0 && <span aria-hidden="true">·</span>}
                        <span>{f}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Showtime Pills */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-3">
                  {cinema.shows.map((show) => {
                    const timeStr = new Date(show.startTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });

                    return (
                      <button
                        key={show._id}
                        onClick={() => navigate(`/seat-selection/${show._id}`)}
                        className="group py-2 px-3.5 rounded-xl bg-slate-900/90 hover:bg-violet-600/30 border border-slate-700/80 hover:border-violet-500 text-left transition-all"
                      >
                        <div className="text-sm font-bold font-mono text-white group-hover:text-violet-300">
                          {timeStr}
                        </div>
                        <div className="text-[10px] text-slate-400 group-hover:text-slate-200 flex items-center gap-1 mt-0.5">
                          <span className="font-semibold text-violet-400">{show.format}</span>
                          <span>·</span>
                          <span>from ₹{show.pricing?.REGULAR || 220}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 relative shadow-2xl flex flex-col items-center justify-center text-center p-6">
            <button
              onClick={() => setTrailerOpen(false)}
              className="absolute top-4 right-4 py-1.5 px-3 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20"
            >
              Close
            </button>
            <Film className="w-12 h-12 text-violet-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">{movie.title} Trailer</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Enjoy standard definition and Dolby Atmos sound previews.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
