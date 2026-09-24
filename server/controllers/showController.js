import dataStore from '../db/dataStore.js';

export const getShows = async (req, res, next) => {
  try {
    const { movieId, cinemaId, city, date } = req.query;

    let showsList = Array.from(dataStore.shows.values());

    if (movieId) {
      showsList = showsList.filter(s => s.movieId === movieId);
    }

    if (cinemaId) {
      showsList = showsList.filter(s => s.cinemaId === cinemaId);
    }

    if (city) {
      showsList = showsList.filter(s => {
        const cinema = dataStore.cinemas.get(s.cinemaId);
        return cinema && cinema.city.toLowerCase() === city.toLowerCase();
      });
    }

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(targetDate.getDate() + 1);

      showsList = showsList.filter(s => {
        const st = new Date(s.startTime);
        return st >= targetDate && st < nextDate;
      });
    }

    // Sort shows chronologically
    showsList.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Enrich with cinema, movie, screen info
    const enrichedShows = showsList.map(s => {
      const cinema = dataStore.cinemas.get(s.cinemaId);
      const movie = dataStore.movies.get(s.movieId);
      const screen = dataStore.screens.get(s.screenId);
      return {
        ...s,
        cinemaName: cinema ? cinema.name : 'Cinevo Cinema',
        cinemaAddress: cinema ? cinema.address : '',
        cinemaCity: cinema ? cinema.city : '',
        facilities: cinema ? cinema.facilities : [],
        movieTitle: movie ? movie.title : '',
        moviePoster: movie ? movie.poster : '',
        movieDuration: movie ? movie.duration : 120,
        screenName: screen ? screen.name : 'Main Screen',
      };
    });

    res.json({
      success: true,
      count: enrichedShows.length,
      data: enrichedShows,
    });
  } catch (error) {
    next(error);
  }
};

export const getShowById = async (req, res, next) => {
  try {
    const show = dataStore.shows.get(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const cinema = dataStore.cinemas.get(show.cinemaId);
    const movie = dataStore.movies.get(show.movieId);
    const screen = dataStore.screens.get(show.screenId);

    res.json({
      success: true,
      data: {
        ...show,
        cinema,
        movie,
        screen: {
          _id: screen._id,
          name: screen.name,
          screenNumber: screen.screenNumber,
          rows: screen.rows,
          seatsPerRow: screen.seatsPerRow,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
