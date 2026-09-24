import React, { useState, useEffect } from 'react';
import { Search, Filter, Film } from 'lucide-react';
import MovieCard from '../components/MovieCard.jsx';
import { moviesAPI } from '../services/api.js';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('NOW_SHOWING');

  const genres = ['all', 'Sci-Fi', 'Action', 'Drama', 'Adventure', 'Biography', 'Crime', 'Thriller'];
  const languages = ['all', 'English', 'Hindi'];
  const formats = ['all', 'IMAX', '4DX', '3D', '2D'];

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        const res = await moviesAPI.getAll({
          genre: selectedGenre !== 'all' ? selectedGenre : undefined,
          language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
          format: selectedFormat !== 'all' ? selectedFormat : undefined,
          status: selectedStatus || undefined,
          search: search || undefined,
        });

        if (res.success) {
          setMovies(res.data);
        }
      } catch (err) {
        console.warn('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [selectedGenre, selectedLanguage, selectedFormat, selectedStatus, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
          Explore Cinema Catalog
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Browse premieres, blockbusters and upcoming theatrical events
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl glass-panel-elevated border border-slate-800/80 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, director, cast..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setSelectedStatus('NOW_SHOWING')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                selectedStatus === 'NOW_SHOWING'
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Now Showing
            </button>
            <button
              onClick={() => setSelectedStatus('UPCOMING')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                selectedStatus === 'UPCOMING'
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Filter Options */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/60 text-xs">
          {/* Genre select */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500"
            >
              {genres.map(g => (
                <option key={g} value={g}>{g === 'all' ? 'All Genres' : g}</option>
              ))}
            </select>
          </div>

          {/* Language select */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500"
            >
              {languages.map(l => (
                <option key={l} value={l}>{l === 'all' ? 'All Languages' : l}</option>
              ))}
            </select>
          </div>

          {/* Format select */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Format:</span>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500"
            >
              {formats.map(f => (
                <option key={f} value={f}>{f === 'all' ? 'All Formats' : f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movie Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-white">No Movies Match Your Filters</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting the filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
