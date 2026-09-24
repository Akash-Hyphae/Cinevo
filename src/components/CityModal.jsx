import React from 'react';
import { MapPin, X, Check } from 'lucide-react';
import { useCity } from '../context/CityContext.jsx';

export default function CityModal() {
  const { cities, selectedCity, selectCity, isCityModalOpen, closeCityModal } = useCity();

  if (!isCityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md rounded-2xl glass-panel-elevated p-6 border border-slate-800 text-slate-100 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Select Your Cinema Hub</h3>
              <p className="text-xs text-slate-400">Discover screenings, IMAX lasers & shows near you</p>
            </div>
          </div>
          <button
            onClick={closeCityModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {cities.map((city) => {
            const isSelected = city.id === selectedCity;
            return (
              <button
                key={city.id}
                onClick={() => selectCity(city.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-violet-600/15 border-violet-500 text-white shadow-sm shadow-violet-900/20'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-violet-400' : 'bg-slate-600'}`} />
                  <div>
                    <div className="font-medium text-sm">{city.name}</div>
                    <div className="text-xs text-slate-400">{city.state}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-violet-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            More cities across the Cinevo luxury network coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
