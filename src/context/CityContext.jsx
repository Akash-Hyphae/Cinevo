import React, { createContext, useContext, useState, useEffect } from 'react';
import { cinemasAPI } from '../services/api.js';

const CityContext = createContext(null);

export function CityProvider({ children }) {
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('cinevo_city') || 'mumbai'
  );
  const [cities, setCities] = useState([]);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await cinemasAPI.getCities();
        if (res.success && res.data) {
          setCities(res.data);
        }
      } catch (err) {
        console.warn('Error loading cities:', err);
      }
    }
    loadCities();
  }, []);

  const selectCity = (cityId) => {
    setSelectedCity(cityId);
    localStorage.setItem('cinevo_city', cityId);
    setIsCityModalOpen(false);
  };

  const getCityName = () => {
    const found = cities.find((c) => c.id === selectedCity);
    return found ? found.name : 'Mumbai';
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        cities,
        cityName: getCityName(),
        isCityModalOpen,
        selectCity,
        openCityModal: () => setIsCityModalOpen(true),
        closeCityModal: () => setIsCityModalOpen(false),
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
