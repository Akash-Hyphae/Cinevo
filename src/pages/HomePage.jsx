import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Play, Shield, Film, Sparkles, MapPin, ArrowRight, Star } from 'lucide-react';
import MovieCard from '../components/MovieCard.jsx';
import { moviesAPI, cinemasAPI } from '../services/api.js';
import { useCity } from '../context/CityContext.jsx';

export default function HomePage() {
  const { selectedCity, cityName, openCityModal } = useCity();
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('NOW_SHOWING'); // 'NOW_SHOWING' | 'UPCOMING'
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [moviesRes, cinemasRes] = await Promise.all([
          moviesAPI.getAll(),
          cinemasAPI.getAll({ city: selectedCity }),
        ]);

        if (moviesRes.success) setMovies(moviesRes.data);
        if (cinemasRes.success) setCinemas(cinemasRes.data);
      } catch (err) {
        console.warn('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, [selectedCity]);

  const featuredMovies = movies.filter(m => m.status === 'NOW_SHOWING');
  const heroMovie = featuredMovies[selectedHeroIndex] || movies[0];

  const filteredMovies = movies.filter((m) => {
    const matchesTab = m.status === activeTab;
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-20">
      {/* 1. CINEMATIC HERO SPOTLIGHT */}
      {heroMovie && (
        <section className="relative w-full min-h-[580px] lg:min-h-[660px] flex items-center overflow-hidden border-b border-slate-800/80">
          {/* Backdrop with Measured Scrim */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroMovie.backdrop}
              alt={heroMovie.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.45] scale-105 transition-transform duration-1000"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090b10] via-[#090b10]/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="max-w-2xl space-y-5">
              {/* Unboxed editorial kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 tracking-wider uppercase">
                <span>Featured Experience</span>
                <span aria-hidden="true">·</span>
                <span>{heroMovie.formats?.join(' · ') || 'IMAX LASER'}</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] text-balance">
                {heroMovie.title}
              </h1>

              {/* Unboxed Metadata */}
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{heroMovie.rating}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>{heroMovie.duration} min</span>
                <span aria-hidden="true">·</span>
                <span>{heroMovie.certificate}</span>
                <span aria-hidden="true">·</span>
                <span>{heroMovie.genres?.join(', ')}</span>
              </div>

              <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed">
                {heroMovie.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to={`/movies/${heroMovie._id}`}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-purple-900/40 flex items-center gap-2 transition-all"
                >
                  <span>Book Tickets</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {heroMovie.trailerUrl && (
                  <button
                    onClick={() => setTrailerModalOpen(true)}
                    className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-md border border-white/20 flex items-center gap-2 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hero Carousel Dots */}
            {featuredMovies.length > 1 && (
              <div className="mt-12 flex items-center gap-2">
                {featuredMovies.slice(0, 5).map((m, idx) => (
                  <button
                    key={m._id}
                    onClick={() => setSelectedHeroIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === selectedHeroIndex ? 'w-8 bg-violet-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    aria-label={`Show ${m.title}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. SEARCH & CITY FILTER STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="p-4 rounded-2xl glass-panel-elevated border border-slate-800/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by movie title, genre, director or cast..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Quick Filter Segmented Control (Functional Buttons) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('NOW_SHOWING')}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'NOW_SHOWING'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Now Showing
            </button>
            <button
              onClick={() => setActiveTab('UPCOMING')}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'UPCOMING'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Coming Soon
            </button>
          </div>

          {/* Selected City Hub Badge Button */}
          <button
            onClick={openCityModal}
            className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 hover:border-violet-500 hover:text-white transition-colors shrink-0"
          >
            <MapPin className="w-4 h-4 text-violet-400" />
            <span className="font-medium text-white">{cityName}</span>
            <span className="text-[11px] text-slate-500">Change</span>
          </button>
        </div>
      </section>

      {/* 3. MOVIES CATALOG GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              {activeTab === 'NOW_SHOWING' ? 'Now Playing in Theatres' : 'Anticipated Upcoming Releases'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your seats with real-time atomic reservation in {cityName}
            </p>
          </div>

          <Link
            to="/movies"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-16 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-base text-white font-semibold">No movies found</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for a different title or genre</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* 4. POPULAR CINEMAS IN SELECTED CITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Cinemas in {cityName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              IMAX Laser, Dolby Atmos & Luxury Recliner Lounges
            </p>
          </div>
          <Link
            to="/cinemas"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>Explore All Venues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cinemas.slice(0, 4).map((cinema) => (
            <div
              key={cinema._id}
              className="p-6 rounded-2xl bg-[#121622] border border-slate-800/80 hover:border-violet-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display font-bold text-lg text-white">
                    {cinema.name}
                  </h3>
                  <span className="text-[11px] font-mono text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/40">
                    {cinema.screens?.length || 2} Screens
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="line-clamp-1">{cinema.address}</span>
                </p>

                {/* Facilities unboxed text */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  {cinema.facilities?.map((f, i) => (
                    <React.Fragment key={f}>
                      {i > 0 && <span aria-hidden="true">·</span>}
                      <span>{f}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Available Shows Today</span>
                <Link
                  to={`/cinemas`}
                  className="py-1.5 px-3.5 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-semibold transition-all"
                >
                  View Showtimes
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TRAILER PREVIEW MODAL */}
      {trailerModalOpen && heroMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 relative shadow-2xl">
            <button
              onClick={() => setTrailerModalOpen(false)}
              className="absolute top-4 right-4 z-10 py-1.5 px-3 rounded-lg bg-black/60 text-white text-xs font-semibold border border-white/20 hover:bg-black/80"
            >
              Close
            </button>
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-300">
              <Film className="w-12 h-12 text-violet-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">{heroMovie.title} — Official Trailer</h3>
              <p className="text-xs text-slate-400 max-w-md">
                Experience high-octane soundscapes and crystal clear projection at Cinevo cinemas.
              </p>
              <div className="mt-6">
                <Link
                  to={`/movies/${heroMovie._id}`}
                  onClick={() => setTrailerModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                >
                  Proceed to Book Tickets
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
