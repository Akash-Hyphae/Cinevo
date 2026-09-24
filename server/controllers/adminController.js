import dataStore from '../db/dataStore.js';

export const getDashboardStats = async (req, res) => {
  const totalMovies = dataStore.movies.size;
  const totalCinemas = dataStore.cinemas.size;
  const totalShows = dataStore.shows.size;
  const totalUsers = dataStore.users.size;

  const allBookings = Array.from(dataStore.bookings.values());
  const confirmedBookings = allBookings.filter(b => b.bookingStatus === 'CONFIRMED');

  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Today's bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayBookings = confirmedBookings.filter(b => new Date(b.createdAt) >= today);
  const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Active seat locks currently in flight
  const now = new Date();
  let activeLocksCount = 0;
  for (const lock of dataStore.seatLocks.values()) {
    if (lock.status === 'LOCKED' && new Date(lock.lockExpiresAt) > now) {
      activeLocksCount++;
    }
  }

  // Recent 10 bookings
  const recentBookings = [...allBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(b => {
      const show = dataStore.shows.get(b.showId);
      const movie = show ? dataStore.movies.get(show.movieId) : null;
      const cinema = show ? dataStore.cinemas.get(show.cinemaId) : null;
      const user = dataStore.users.get(b.userId);

      return {
        _id: b._id,
        bookingReference: b.bookingReference,
        userName: user ? user.name : 'Customer',
        userEmail: user ? user.email : '',
        movieTitle: movie ? movie.title : 'Movie',
        cinemaName: cinema ? cinema.name : 'Cinema',
        seats: b.seats.map(s => s.seatId).join(', '),
        totalAmount: b.totalAmount,
        bookingStatus: b.bookingStatus,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt,
      };
    });

  res.json({
    success: true,
    data: {
      totalMovies,
      totalCinemas,
      totalShows,
      totalUsers,
      totalBookings: confirmedBookings.length,
      totalRevenue: Math.round(totalRevenue),
      todayBookingsCount: todayBookings.length,
      todayRevenue: Math.round(todayRevenue),
      activeLocksCount,
      recentBookings,
    },
  });
};

export const createMovie = async (req, res, next) => {
  try {
    const { title, description, poster, backdrop, duration, language, genres, certificate, releaseDate, cast, director, formats } = req.body;

    if (!title || !description || !duration || !language || !director) {
      return res.status(400).json({ success: false, message: 'Please provide all required movie details.' });
    }

    const movieId = `m_${Date.now()}`;
    const newMovie = {
      _id: movieId,
      title,
      description,
      poster: poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      backdrop: backdrop || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
      duration: Number(duration),
      language,
      genres: Array.isArray(genres) ? genres : [genres],
      certificate: certificate || 'UA',
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      cast: Array.isArray(cast) ? cast : cast ? [cast] : [],
      director,
      rating: 8.5,
      status: 'NOW_SHOWING',
      formats: formats || ['2D', '3D', 'IMAX'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dataStore.movies.set(movieId, newMovie);

    res.status(201).json({
      success: true,
      message: 'Movie added successfully.',
      data: newMovie,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = dataStore.movies.get(id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    const updated = { ...movie, ...req.body, updatedAt: new Date() };
    dataStore.movies.set(id, updated);

    res.json({ success: true, message: 'Movie updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!dataStore.movies.has(id)) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    dataStore.movies.delete(id);
    res.json({ success: true, message: 'Movie removed from listings' });
  } catch (error) {
    next(error);
  }
};

export const createShow = async (req, res, next) => {
  try {
    const { movieId, cinemaId, screenId, startTime, format, pricing } = req.body;

    if (!movieId || !cinemaId || !screenId || !startTime) {
      return res.status(400).json({ success: false, message: 'All show parameters are required.' });
    }

    const movie = dataStore.movies.get(movieId);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    const st = new Date(startTime);
    const et = new Date(st.getTime() + movie.duration * 60 * 1000);

    const showId = `show_${Date.now()}`;
    const newShow = {
      _id: showId,
      movieId,
      cinemaId,
      screenId,
      startTime: st,
      endTime: et,
      language: movie.language,
      format: format || '2D',
      pricing: pricing || { REGULAR: 220, PREMIUM: 350, RECLINER: 550 },
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dataStore.shows.set(showId, newShow);

    res.status(201).json({
      success: true,
      message: 'Show created successfully',
      data: newShow,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!dataStore.shows.has(id)) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    dataStore.shows.delete(id);
    res.json({ success: true, message: 'Show cancelled and removed' });
  } catch (error) {
    next(error);
  }
};

// LIVE RACE CONDITION AND CONCURRENCY VERIFICATION TEST
export const runConcurrencyTest = async (req, res) => {
  const { showId = 'show_2', seatId = 'B6', simulatedUsersCount = 5 } = req.body;

  // Clear any existing locks for this test seat first so test is repeatable
  const lockKey = `${showId}_${seatId}`;
  dataStore.seatLocks.delete(lockKey);

  const results = [];
  const testPromises = [];

  // Launch N simultaneous lock requests at the exact same millisecond
  for (let i = 1; i <= simulatedUsersCount; i++) {
    const virtualUserId = `virtual_user_${i}`;
    const promise = dataStore
      .lockSeatsAtomically({
        showId,
        seatIds: [seatId],
        userId: virtualUserId,
      })
      .then((data) => {
        results.push({
          user: `User ${i}`,
          status: 'SUCCESS',
          code: 200,
          seat: seatId,
          message: 'Seat successfully reserved for 5 minutes',
        });
      })
      .catch((err) => {
        results.push({
          user: `User ${i}`,
          status: 'REJECTED_CONFLICT',
          code: err.status || 409,
          seat: seatId,
          message: err.message,
        });
      });

    testPromises.push(promise);
  }

  await Promise.all(testPromises);

  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const conflictCount = results.filter(r => r.status === 'REJECTED_CONFLICT').length;

  res.json({
    success: true,
    testSummary: {
      testName: 'Simultaneous Multi-User Atomic Seat Lock Test',
      targetShowId: showId,
      targetSeatId: seatId,
      totalConcurrentAttempts: simulatedUsersCount,
      successfulLocksGranted: successCount,
      conflictsBlocked: conflictCount,
      raceConditionDetected: successCount > 1,
      guaranteeVerified: successCount === 1 && conflictCount === (simulatedUsersCount - 1),
    },
    detailedLogs: results,
  });
};

export const getMongoStatus = async (req, res) => {
  const mongoose = (await import('mongoose')).default;
  const readyState = mongoose.connection.readyState;
  res.json({
    success: true,
    data: {
      isConnected: readyState === 1,
      readyState,
      databaseName: mongoose.connection.name || '',
      host: mongoose.connection.host || '',
      hasEnvUri: Boolean(process.env.MONGO_URI),
    },
  });
};

export const seedMongoData = async (req, res, next) => {
  try {
    const { seedHugeDataToMongoDB } = await import('../services/mongoSeeder.js');
    const { mongoUri } = req.body || {};
    const result = await seedHugeDataToMongoDB(mongoUri);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

