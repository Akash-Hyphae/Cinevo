import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Film, Clock, Sparkles } from 'lucide-react';
import { cinemasAPI, showsAPI } from '../services/api.js';
import { useCity } from '../context/CityContext.jsx';

export default function CinemaShowsPage() {
  const { selectedCity, cityName } = useCity();
  const [cinemas, setCinemas] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const [cinemasRes, showsRes] = await Promise.all([
          cinemasAPI.getAll({ city: selectedCity }),
          showsAPI.getAll({ city: selectedCity, date: today }),
        ]);

        if (cinemasRes.success) setCinemas(cinemasRes.data);
        if (showsRes.success) setShows(showsRes.data);
      } catch (err) {
        console.warn('Error loading cinema shows:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
          Cinemas & Screenings in {cityName}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore luxury recliner auditoriums, IMAX laser screenings, and today's schedule
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : cinemas.length === 0 ? (
        <div className="text-center py-20 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-white">No Cinemas in {cityName}</h3>
          <p className="text-xs text-slate-400 mt-1">Select another cinema hub from the navbar</p>
        </div>
      ) : (
        <div className="space-y-8">
          {cinemas.map((cinema) => {
            const cinemaShows = shows.filter((s) => s.cinemaId === cinema._id);

            return (
              <div
                key={cinema._id}
                className="p-6 rounded-3xl bg-[#121622] border border-slate-800/80 shadow-xl space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <h2 className="font-display font-bold text-xl text-white">
                      {cinema.name}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cinema.address}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    {cinema.facilities?.map((f, idx) => (
                      <React.Fragment key={f}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <span>{f}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Shows list */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-3">
                    Screenings Scheduled Today
                  </h3>

                  {cinemaShows.length === 0 ? (
                    <p className="text-xs text-slate-500">No more shows scheduled for today.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {cinemaShows.map((show) => {
                        const timeStr = new Date(show.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        });

                        return (
                          <Link
                            key={show._id}
                            to={`/seat-selection/${show._id}`}
                            className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-violet-500/60 transition-all flex items-start gap-3 group"
                          >
                            {show.moviePoster && (
                              <img
                                src={show.moviePoster}
                                alt={show.movieTitle}
                                referrerPolicy="no-referrer"
                                className="w-12 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs text-white group-hover:text-violet-300 truncate">
                                {show.movieTitle}
                              </h4>
                              <div className="text-sm font-bold font-mono text-white mt-1">
                                {timeStr}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <span className="font-semibold text-violet-400">{show.format}</span>
                                <span>·</span>
                                <span>{show.screenName}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
