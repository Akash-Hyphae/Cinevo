import dataStore from '../db/dataStore.js';
import { initialCities } from '../db/seedData.js';

export const getCities = async (req, res) => {
  res.json({
    success: true,
    data: initialCities,
  });
};

export const getCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;
    let list = Array.from(dataStore.cinemas.values());

    if (city) {
      list = list.filter(c => c.city.toLowerCase() === city.toLowerCase());
    }

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

export const getCinemaById = async (req, res, next) => {
  try {
    const cinema = dataStore.cinemas.get(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }

    const screens = cinema.screens.map(sId => dataStore.screens.get(sId)).filter(Boolean);

    res.json({
      success: true,
      data: {
        ...cinema,
        screens,
      },
    });
  } catch (error) {
    next(error);
  }
};
