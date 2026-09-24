import dataStore from '../db/dataStore.js';

export const getMovies = async (req, res, next) => {
  try {
    const { genre, language, format, status, search, city } = req.query;

    let moviesList = Array.from(dataStore.movies.values());

    if (status) {
      moviesList = moviesList.filter(m => m.status === status.toUpperCase());
    }

    if (genre && genre !== 'all') {
      moviesList = moviesList.filter(m =>
        m.genres.some(g => g.toLowerCase() === genre.toLowerCase())
      );
    }

    if (language && language !== 'all') {
      moviesList = moviesList.filter(m => m.language.toLowerCase() === language.toLowerCase());
    }

    if (format && format !== 'all') {
      moviesList = moviesList.filter(m => m.formats && m.formats.includes(format.toUpperCase()));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      moviesList = moviesList.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.cast.some(c => c.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: moviesList.length,
      data: moviesList,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const movie = dataStore.movies.get(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Get active shows count for this movie
    const activeShows = Array.from(dataStore.shows.values()).filter(s => s.movieId === movie._id);

    res.json({
      success: true,
      data: {
        ...movie,
        totalActiveShows: activeShows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
