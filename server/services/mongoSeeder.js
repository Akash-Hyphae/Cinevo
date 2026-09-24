import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config/index.js';
import dataStore from '../db/dataStore.js';
import Movie from '../models/Movie.js';
import Cinema from '../models/Cinema.js';
import Screen from '../models/Screen.js';
import Show from '../models/Show.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import SeatLock from '../models/SeatLock.js';
import { RAW_MOVIES, RAW_CINEMAS, generateRealisticSeatLayout } from './hugeDatasetGenerator.js';

export async function seedHugeDataToMongoDB(customMongoUri = null) {
  let isConnectedToMongo = mongoose.connection.readyState === 1;
  const targetUri = customMongoUri || process.env.MONGO_URI || config.mongoUri;

  // Try to connect to MongoDB if not currently connected and URI is available
  if (!isConnectedToMongo && targetUri && targetUri.trim() !== '') {
    try {
      console.log(`[MongoSeeder] Connecting to MongoDB: ${targetUri.replace(/:\/\/.*@/, '://***:***@')}...`);
      await mongoose.connect(targetUri.trim(), {
        serverSelectionTimeoutMS: 8000,
      });
      isConnectedToMongo = true;
      console.log('[MongoSeeder] Connected successfully to MongoDB Cluster!');
    } catch (connErr) {
      console.warn('[MongoSeeder] Warning: Could not connect to MongoDB:', connErr.message);
    }
  }

  console.log('[MongoSeeder] Building comprehensive dataset with 20+ movies, 15+ cinemas, 45+ screens, and 500+ shows...');

  // Generate valid MongoDB ObjectIds for all entities
  const salt = bcrypt.genSaltSync(10);
  const userPasswordHash = bcrypt.hashSync('Password123!', salt);
  const adminPasswordHash = bcrypt.hashSync('AdminSecret123!', salt);

  // 1. Users
  const rawUsers = [
    {
      _id: new mongoose.Types.ObjectId(),
      name: 'Cinevo Master Administrator',
      email: 'admin@cinevo.com',
      password: adminPasswordHash,
      role: 'ADMIN',
      isEmailVerified: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date(),
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: 'Aarav Sharma',
      email: 'user@cinevo.com',
      password: userPasswordHash,
      role: 'USER',
      isEmailVerified: true,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date(),
    },
  ];

  const userNames = [
    'Priya Patel', 'Rohan Verma', 'Ananya Iyer', 'Vikramaditya Rao', 'Neha Sen',
    'Kabir Kapoor', 'Sneha Reddy', 'Aditya Nair', 'Tanvi Saxena', 'Karan Malhotra',
    'Rhea Deshmukh', 'Arjun Singhania', 'Meera Bhattacharya', 'Devendra Joshi', 'Simran Arora',
    'Nikhil Chawla', 'Isha Sundaram', 'Gaurav Kulkarni', 'Pooja Hegde', 'Rahul Banerjee',
    'Tara Alva', 'Samarth Mathur', 'Anushka Dutta', 'Manish Agrawal', 'Deepika Pillai'
  ];

  userNames.forEach((name, idx) => {
    const emailPrefix = name.toLowerCase().replace(/\s+/g, '.');
    rawUsers.push({
      _id: new mongoose.Types.ObjectId(),
      name,
      email: `${emailPrefix}@cinevo-audience.com`,
      password: userPasswordHash,
      role: 'USER',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - (idx * 86400000 * 2)),
      updatedAt: new Date(),
    });
  });

  // 2. Movies
  const rawMovies = RAW_MOVIES.map((m) => ({
    _id: new mongoose.Types.ObjectId(),
    title: m.title,
    description: m.description,
    poster: m.poster,
    backdrop: m.backdrop,
    trailerUrl: m.trailerUrl,
    duration: m.duration,
    language: m.language,
    genres: m.genres,
    certificate: m.certificate,
    releaseDate: new Date(m.releaseDate),
    cast: m.cast,
    director: m.director,
    rating: m.rating,
    status: m.status,
    formats: m.formats,
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date(),
  }));

  // 3. Cinemas & Screens
  const rawCinemas = [];
  const rawScreens = [];

  RAW_CINEMAS.forEach((c, cIdx) => {
    const cinemaId = new mongoose.Types.ObjectId();
    const screenIds = [];

    const screenConfigs = [
      { name: 'Screen 1 - IMAX Laser Experience', screenNumber: 1, format: 'IMAX', basePrice: 280 },
      { name: 'Screen 2 - Dolby Atmos 4K Digital', screenNumber: 2, format: '2D', basePrice: 220 },
      { name: 'Screen 3 - 4DX Motion Theatre', screenNumber: 3, format: '4DX', basePrice: 320 },
    ];

    screenConfigs.forEach((sc, scIdx) => {
      const screenId = new mongoose.Types.ObjectId();
      screenIds.push(screenId);

      rawScreens.push({
        _id: screenId,
        cinemaId,
        name: sc.name,
        screenNumber: sc.screenNumber,
        rows: 12,
        seatsPerRow: 16,
        format: sc.format,
        basePrice: sc.basePrice,
        seatLayout: generateRealisticSeatLayout(),
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date(),
      });
    });

    rawCinemas.push({
      _id: cinemaId,
      name: c.name,
      city: c.city,
      address: c.address,
      facilities: c.facilities,
      screens: screenIds,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date(),
    });
  });

  // 4. Shows
  const rawShows = [];
  const showTimes = [
    { hour: 9, minute: 30 },
    { hour: 13, minute: 0 },
    { hour: 16, minute: 45 },
    { hour: 20, minute: 15 },
    { hour: 23, minute: 30 },
  ];

  const now = new Date();
  const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(todayZero.getTime() + dayOffset * 86400000);

    rawCinemas.forEach((cinema, cinIndex) => {
      cinema.screens.forEach((screenId, scrIndex) => {
        const screenObj = rawScreens.find((s) => String(s._id) === String(screenId));
        const movieIndex = (cinIndex * 3 + scrIndex + dayOffset) % rawMovies.length;
        const selectedMovie = rawMovies[movieIndex];

        showTimes.forEach((st) => {
          const startTime = new Date(targetDate);
          startTime.setHours(st.hour, st.minute, 0, 0);
          const endTime = new Date(startTime.getTime() + (selectedMovie.duration + 20) * 60 * 1000);

          const base = screenObj ? screenObj.basePrice : 220;
          const pricing = {
            REGULAR: base,
            PREMIUM: Math.round(base * 1.5),
            RECLINER: Math.round(base * 2.3),
          };

          const showFormat = (screenObj && screenObj.format) ? screenObj.format : (selectedMovie.formats[0] || '2D');

          rawShows.push({
            _id: new mongoose.Types.ObjectId(),
            movieId: selectedMovie._id,
            cinemaId: cinema._id,
            screenId,
            startTime,
            endTime,
            language: selectedMovie.language,
            format: showFormat,
            pricing,
            status: 'ACTIVE',
            createdAt: new Date('2026-02-01'),
            updatedAt: new Date(),
          });
        });
      });
    });
  }

  // 5. Bookings
  const rawBookings = [];
  const pastShows = rawShows.filter((s) => new Date(s.startTime) <= new Date(Date.now() + 86400000)).slice(0, 100);

  pastShows.forEach((show, bIdx) => {
    const customer = rawUsers[(bIdx % (rawUsers.length - 2)) + 2] || rawUsers[1];
    const seatRow = ['D', 'E', 'F', 'G', 'H', 'J'][bIdx % 6];
    const seatCol1 = (bIdx % 10) + 1;
    const seatCol2 = seatCol1 + 1;

    const bookedSeats = [
      {
        seatId: `${seatRow}${seatCol1}`,
        seatNumber: `${seatRow}${seatCol1}`,
        row: seatRow,
        column: seatCol1,
        category: bIdx % 2 === 0 ? 'REGULAR' : 'PREMIUM',
        price: bIdx % 2 === 0 ? show.pricing.REGULAR : show.pricing.PREMIUM,
      },
      {
        seatId: `${seatRow}${seatCol2}`,
        seatNumber: `${seatRow}${seatCol2}`,
        row: seatRow,
        column: seatCol2,
        category: bIdx % 2 === 0 ? 'REGULAR' : 'PREMIUM',
        price: bIdx % 2 === 0 ? show.pricing.REGULAR : show.pricing.PREMIUM,
      },
    ];

    const ticketAmount = bookedSeats.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = bookedSeats.length * 30;
    const taxes = Math.round((ticketAmount + convenienceFee) * 0.18 * 100) / 100;
    const totalAmount = Math.round((ticketAmount + convenienceFee + taxes) * 100) / 100;

    const bookingRef = `CNV-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    rawBookings.push({
      _id: new mongoose.Types.ObjectId(),
      userId: customer._id,
      showId: show._id,
      seats: bookedSeats,
      ticketAmount,
      convenienceFee,
      taxes,
      totalAmount,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentId: `pay_rzp_mock_${Date.now() - bIdx * 3600000}_${bIdx}`,
      orderId: `order_seed_${Date.now() - bIdx * 3600000}_${bIdx}`,
      idempotencyKey: `idemp_seed_${bIdx + 1}`,
      bookingReference: bookingRef,
      lockExpiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(Date.now() - bIdx * 7200000),
      updatedAt: new Date(Date.now() - bIdx * 7200000),
    });
  });

  // --- MONGODB CLUSTER BULK UPLOAD ---
  let mongoUploadSuccess = false;
  let mongoDetails = null;

  if (isConnectedToMongo) {
    try {
      console.log('[MongoSeeder] Purging old collections and bulk uploading to MongoDB...');
      await Promise.allSettled([
        Movie.deleteMany({}),
        Cinema.deleteMany({}),
        Screen.deleteMany({}),
        Show.deleteMany({}),
        User.deleteMany({}),
        Booking.deleteMany({}),
        SeatLock.deleteMany({}),
      ]);

      await Movie.insertMany(rawMovies);
      await Cinema.insertMany(rawCinemas);
      await Screen.insertMany(rawScreens);
      await Show.insertMany(rawShows);
      await User.insertMany(rawUsers);
      await Booking.insertMany(rawBookings);

      mongoUploadSuccess = true;
      mongoDetails = {
        databaseName: mongoose.connection.name || 'cinevo',
        host: mongoose.connection.host || 'cluster',
        readyState: mongoose.connection.readyState,
      };
      console.log(`[MongoSeeder] MongoDB bulk upload completed into database "${mongoDetails.databaseName}"!`);
    } catch (mongoUploadErr) {
      console.error('[MongoSeeder] MongoDB bulk insertion error:', mongoUploadErr);
    }
  }

  // --- SYNCHRONIZE ACTIVE DATASTORE ---
  // Populate in-memory dataStore so UI immediately reflects all items
  console.log('[MongoSeeder] Synchronizing active in-memory transactional datastore...');
  dataStore.movies.clear();
  dataStore.cinemas.clear();
  dataStore.shows.clear();
  dataStore.users.clear();
  dataStore.bookings.clear();
  dataStore.seatLocks.clear();

  // Populate movies
  rawMovies.forEach((m) => {
    dataStore.movies.set(String(m._id), { ...m, _id: String(m._id) });
  });

  // Populate cinemas
  rawCinemas.forEach((c) => {
    const screensForCin = rawScreens
      .filter((s) => String(s.cinemaId) === String(c._id))
      .map((s) => ({ ...s, _id: String(s._id), cinemaId: String(s.cinemaId) }));

    dataStore.cinemas.set(String(c._id), {
      ...c,
      _id: String(c._id),
      screens: screensForCin,
    });
  });

  // Populate shows
  rawShows.forEach((s) => {
    dataStore.shows.set(String(s._id), {
      ...s,
      _id: String(s._id),
      movieId: String(s.movieId),
      cinemaId: String(s.cinemaId),
      screenId: String(s.screenId),
    });
  });

  // Populate users
  rawUsers.forEach((u) => {
    dataStore.users.set(String(u._id), {
      ...u,
      _id: String(u._id),
    });
  });

  // Populate bookings & mark seats
  rawBookings.forEach((b) => {
    const bookingStrId = String(b._id);
    const showStrId = String(b.showId);
    const userStrId = String(b.userId);

    dataStore.bookings.set(bookingStrId, {
      ...b,
      _id: bookingStrId,
      showId: showStrId,
      userId: userStrId,
    });

    // Mark seats as booked
    b.seats.forEach((seat) => {
      dataStore.seatLocks.set(`${showStrId}_${seat.seatId}`, {
        showId: showStrId,
        seatId: seat.seatId,
        userId: userStrId,
        bookingId: bookingStrId,
        status: 'CONVERTED_TO_BOOKING',
        lockedAt: b.createdAt,
        lockExpiresAt: new Date(Date.now() + 86400000),
      });
    });
  });

  const summary = {
    moviesCount: rawMovies.length,
    cinemasCount: rawCinemas.length,
    screensCount: rawScreens.length,
    showsCount: rawShows.length,
    usersCount: rawUsers.length,
    bookingsCount: rawBookings.length,
    totalSeatsPerScreen: 192,
    totalSeatsConfigured: rawScreens.length * 192,
    mongoConnected: mongoUploadSuccess,
    mongoDetails,
  };

  return {
    success: true,
    message: mongoUploadSuccess
      ? `Successfully uploaded huge test dataset to MongoDB database "${mongoDetails?.databaseName}" and updated live datastore!`
      : 'Huge test dataset generated and populated into live datastore! (MongoDB cluster URI can also be configured to sync to external cluster).',
    summary,
  };
}

export default seedHugeDataToMongoDB;
