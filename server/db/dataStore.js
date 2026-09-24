import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { initialCities, initialMovies, initialCinemas, generateStandardSeatLayout } from './seedData.js';
import { config } from '../config/index.js';

// In-Memory Database Engine with Atomic Operations, Concurrency Locks, and TTL Verification
class DataStore {
  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.cinemas = new Map();
    this.screens = new Map();
    this.shows = new Map();
    this.seatLocks = new Map(); // key: `${showId}_${seatId}` -> SeatLock
    this.bookings = new Map();
    this.idempotencyRecords = new Map();
    this.emailVerificationMailbox = []; // Simulated mailbox for testing & verification link inspection

    // Mutex lock map per show to ensure strict serialization of lock requests
    this.showMutexes = new Map();

    this.init();
  }

  async init() {
    // 1. Seed Cities and Movies
    initialMovies.forEach(m => this.movies.set(m._id, { ...m, createdAt: new Date(), updatedAt: new Date() }));

    // 2. Seed Cinemas and Screens
    const standardLayout = generateStandardSeatLayout();

    initialCinemas.forEach((c) => {
      const screenIds = [];
      c.screenNames.forEach((sName, sIdx) => {
        const screenId = `scr_${c._id}_${sIdx + 1}`;
        screenIds.push(screenId);
        this.screens.set(screenId, {
          _id: screenId,
          cinemaId: c._id,
          name: sName,
          screenNumber: sIdx + 1,
          rows: 8,
          seatsPerRow: 12,
          seatLayout: standardLayout,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      this.cinemas.set(c._id, {
        _id: c._id,
        name: c.name,
        city: c.city,
        address: c.address,
        facilities: c.facilities,
        screens: screenIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // 3. Seed Shows (for today and next 4 days)
    const formatsList = ['IMAX', '4DX', '3D', '2D'];
    const times = ['10:30', '13:45', '16:30', '19:45', '22:30'];
    let showCounter = 1;

    const today = new Date();

    this.cinemas.forEach((cinema) => {
      cinema.screens.forEach((screenId, screenIdx) => {
        // Assign 1-2 movies per screen
        const movie1 = initialMovies[screenIdx % initialMovies.length];
        const movie2 = initialMovies[(screenIdx + 3) % initialMovies.length];

        for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
          const showDate = new Date(today);
          showDate.setDate(today.getDate() + dayOffset);

          times.forEach((timeStr, tIdx) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const startTime = new Date(showDate);
            startTime.setHours(hours, minutes, 0, 0);

            const chosenMovie = tIdx % 2 === 0 ? movie1 : movie2;
            const endTime = new Date(startTime.getTime() + chosenMovie.duration * 60 * 1000);
            const format = formatsList[(screenIdx + tIdx) % formatsList.length];

            const showId = `show_${showCounter++}`;
            this.shows.set(showId, {
              _id: showId,
              movieId: chosenMovie._id,
              cinemaId: cinema._id,
              screenId: screenId,
              startTime,
              endTime,
              language: chosenMovie.language,
              format,
              pricing: {
                REGULAR: format === 'IMAX' ? 320 : format === '4DX' ? 400 : 220,
                PREMIUM: format === 'IMAX' ? 480 : format === '4DX' ? 550 : 350,
                RECLINER: format === 'IMAX' ? 750 : format === '4DX' ? 850 : 550,
              },
              status: 'ACTIVE',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          });
        }
      });
    });

    // 4. Seed Default Users with bcrypt
    const userPasswordHash = await bcrypt.hash('Password123!', 10);
    const adminPasswordHash = await bcrypt.hash('AdminSecret123!', 10);

    const demoUser = {
      _id: 'usr_demo_1',
      name: 'Alex Mercer',
      email: 'user@cinevo.com',
      password: userPasswordHash,
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const demoAdmin = {
      _id: 'usr_admin_1',
      name: 'Elena Rostova',
      email: 'admin@cinevo.com',
      password: adminPasswordHash,
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(demoUser._id, demoUser);
    this.users.set(demoAdmin._id, demoAdmin);

    // 5. Seed a few existing bookings for realism on show_1
    this.seedRealisticBookings('show_1', demoUser._id);

    // Start background TTL cleaner every 30 seconds (unref so tests exit cleanly)
    const cleanupTimer = setInterval(() => this.cleanupExpiredLocks(), 30000);
    if (cleanupTimer.unref) cleanupTimer.unref();
  }

  seedRealisticBookings(showId, userId) {
    const bookedSeats = [
      { seatId: 'C4', seatNumber: 'C4', row: 'C', column: 4, category: 'PREMIUM', price: 350 },
      { seatId: 'C5', seatNumber: 'C5', row: 'C', column: 5, category: 'PREMIUM', price: 350 },
      { seatId: 'E7', seatNumber: 'E7', row: 'E', column: 7, category: 'REGULAR', price: 220 },
    ];

    const bookingRef = 'CNV-2026-X7K92P';
    const booking = {
      _id: 'bkg_seed_1',
      userId,
      showId,
      seats: bookedSeats,
      ticketAmount: 920,
      taxes: 165.6,
      convenienceFee: 60,
      totalAmount: 1145.6,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentId: 'pay_seed_sample_7718',
      orderId: 'order_seed_9981',
      bookingReference: bookingRef,
      lockExpiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
    };

    this.bookings.set(booking._id, booking);

    bookedSeats.forEach(s => {
      const lockKey = `${showId}_${s.seatId}`;
      this.seatLocks.set(lockKey, {
        showId,
        seatId: s.seatId,
        userId,
        bookingId: booking._id,
        status: 'CONVERTED_TO_BOOKING',
        lockedAt: new Date(Date.now() - 3600000),
        lockExpiresAt: new Date(Date.now() + 86400000),
      });
    });
  }

  // --- MUTEX SYNCHRONIZATION FOR SHOW SEAT ATOMICITY ---
  async withShowMutex(showId, asyncCallback) {
    while (this.showMutexes.get(showId)) {
      await new Promise(res => setTimeout(res, 5));
    }
    this.showMutexes.set(showId, true);
    try {
      return await asyncCallback();
    } finally {
      this.showMutexes.delete(showId);
    }
  }

  // --- SEAT AVAILABILITY & LOCKING ENGINE ---
  getSeatState(showId, seatId, currentUserId = null) {
    const lockKey = `${showId}_${seatId}`;
    const lock = this.seatLocks.get(lockKey);
    const now = new Date();

    if (!lock) {
      return { status: 'AVAILABLE', seatId };
    }

    if (lock.status === 'CONVERTED_TO_BOOKING') {
      return { status: 'BOOKED', seatId };
    }

    if (lock.status === 'LOCKED') {
      // Check lock expiration strictly
      if (new Date(lock.lockExpiresAt) > now) {
        const isMine = currentUserId && String(lock.userId) === String(currentUserId);
        const remainingSeconds = Math.max(0, Math.floor((new Date(lock.lockExpiresAt).getTime() - now.getTime()) / 1000));
        return {
          status: isMine ? 'SELECTED_BY_ME' : 'LOCKED',
          seatId,
          lockedByMe: isMine,
          expiresAt: lock.lockExpiresAt,
          remainingSeconds,
        };
      }
      // Expired lock: immediately available!
      return { status: 'AVAILABLE', seatId };
    }

    return { status: 'AVAILABLE', seatId };
  }

  // Atomic Multi-Seat Lock with Zero Race-Condition Guarantee
  async lockSeatsAtomically({ showId, seatIds, userId }) {
    if (!showId || !seatIds || !seatIds.length || !userId) {
      throw { status: 400, message: 'Invalid lock request parameters' };
    }

    return this.withShowMutex(showId, async () => {
      const now = new Date();
      const lockExpiresAt = new Date(now.getTime() + config.lockDurationMs);

      // 1. Verify show exists
      const show = this.shows.get(showId);
      if (!show) {
        throw { status: 404, message: 'Show not found' };
      }

      // 2. Atomic Pre-Check: Check ALL requested seats
      for (const seatId of seatIds) {
        const lockKey = `${showId}_${seatId}`;
        const existingLock = this.seatLocks.get(lockKey);

        if (existingLock) {
          // If already permanently booked
          if (existingLock.status === 'CONVERTED_TO_BOOKING') {
            throw {
              status: 409,
              message: `Seat ${seatId} has already been booked.`,
              conflictSeat: seatId,
            };
          }

          // If actively locked by another user
          if (
            existingLock.status === 'LOCKED' &&
            new Date(existingLock.lockExpiresAt) > now &&
            String(existingLock.userId) !== String(userId)
          ) {
            throw {
              status: 409,
              message: `Seat ${seatId} is currently reserved by another customer.`,
              conflictSeat: seatId,
            };
          }
        }
      }

      // 3. Atomically acquire locks for all requested seats
      const lockedSeats = [];
      for (const seatId of seatIds) {
        const lockKey = `${showId}_${seatId}`;
        const lockRecord = {
          showId,
          seatId,
          userId,
          bookingId: null,
          status: 'LOCKED',
          lockedAt: now,
          lockExpiresAt,
        };
        this.seatLocks.set(lockKey, lockRecord);
        lockedSeats.push(seatId);
      }

      return {
        success: true,
        showId,
        lockedSeats,
        lockedAt: now,
        lockExpiresAt,
        durationSeconds: config.lockDurationMs / 1000,
      };
    });
  }

  // Release seats (e.g. user deselects or navigates away)
  async releaseSeats({ showId, seatIds, userId }) {
    return this.withShowMutex(showId, async () => {
      seatIds.forEach((seatId) => {
        const lockKey = `${showId}_${seatId}`;
        const lock = this.seatLocks.get(lockKey);
        if (lock && String(lock.userId) === String(userId) && lock.status === 'LOCKED') {
          this.seatLocks.delete(lockKey);
        }
      });
      return { success: true };
    });
  }

  // Background/On-demand TTL Cleanup
  cleanupExpiredLocks() {
    const now = new Date();
    for (const [key, lock] of this.seatLocks.entries()) {
      if (lock.status === 'LOCKED' && new Date(lock.lockExpiresAt) <= now) {
        this.seatLocks.delete(key);
      }
    }
  }

  // --- BOOKING ENGINE WITH IDEMPOTENCY & VERIFICATION ---
  async createBooking({ userId, showId, seats, idempotencyKey }) {
    // 1. Idempotency verification
    if (idempotencyKey && this.idempotencyRecords.has(idempotencyKey)) {
      const existingBookingId = this.idempotencyRecords.get(idempotencyKey);
      return this.bookings.get(existingBookingId);
    }

    return this.withShowMutex(showId, async () => {
      const now = new Date();
      const show = this.shows.get(showId);
      if (!show) throw { status: 404, message: 'Show not found' };

      const screen = this.screens.get(show.screenId);
      if (!screen) throw { status: 404, message: 'Screen not found' };

      // 2. Server-side validation of active seat locks
      let ticketAmount = 0;
      const verifiedSeats = [];

      for (const item of seats) {
        const seatId = item.seatId || item;
        const lockKey = `${showId}_${seatId}`;
        const lock = this.seatLocks.get(lockKey);

        if (!lock) {
          throw { status: 409, message: `Seat ${seatId} is not reserved. Please select again.` };
        }

        if (lock.status !== 'LOCKED') {
          throw { status: 409, message: `Seat ${seatId} reservation is invalid.` };
        }

        if (new Date(lock.lockExpiresAt) <= now) {
          throw { status: 410, message: `Your 5-minute reservation for seat ${seatId} has expired.` };
        }

        if (String(lock.userId) !== String(userId)) {
          throw { status: 403, message: `Seat ${seatId} is reserved by another session.` };
        }

        // Calculate authoritative price from show pricing
        const layoutSeat = screen.seatLayout.find(s => s.seatId === seatId);
        const category = layoutSeat ? layoutSeat.category : 'REGULAR';
        const price = show.pricing[category] || 220;

        ticketAmount += price;
        verifiedSeats.push({
          seatId,
          seatNumber: seatId,
          row: seatId.charAt(0),
          column: parseInt(seatId.slice(1), 10) || 1,
          category,
          price,
        });
      }

      // Calculate taxes & convenience fee
      const convenienceFee = verifiedSeats.length * 30; // ₹30 per ticket
      const taxes = Math.round((ticketAmount + convenienceFee) * 0.18 * 100) / 100; // 18% GST
      const totalAmount = Math.round((ticketAmount + convenienceFee + taxes) * 100) / 100;

      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const bookingReference = `CNV-2026-${randomSuffix}`;

      // Expiration matches earliest lock expiration
      const earliestLockExpiry = new Date(
        Math.min(...verifiedSeats.map(s => this.seatLocks.get(`${showId}_${s.seatId}`).lockExpiresAt.getTime()))
      );

      const bookingId = `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const booking = {
        _id: bookingId,
        userId,
        showId,
        seats: verifiedSeats,
        ticketAmount,
        convenienceFee,
        taxes,
        totalAmount,
        bookingStatus: 'PENDING',
        paymentStatus: 'PENDING',
        paymentId: null,
        orderId: `order_${Date.now()}`,
        idempotencyKey,
        bookingReference,
        lockExpiresAt: earliestLockExpiry,
        createdAt: now,
        updatedAt: now,
      };

      this.bookings.set(bookingId, booking);

      if (idempotencyKey) {
        this.idempotencyRecords.set(idempotencyKey, bookingId);
      }

      return booking;
    });
  }

  // Confirm booking upon successful payment verification
  async confirmBookingPayment({ bookingId, paymentId, orderId, signature, idempotencyKey }) {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw { status: 404, message: 'Booking not found' };

    if (booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID') {
      return booking; // Already processed idempotently
    }

    return this.withShowMutex(booking.showId, async () => {
      const now = new Date();

      // Check if lock expired before payment verification
      if (new Date(booking.lockExpiresAt) <= now) {
        booking.bookingStatus = 'EXPIRED';
        booking.paymentStatus = 'FAILED';
        booking.updatedAt = now;
        throw { status: 410, message: 'Seat reservation expired before payment completed. Payment refunded.' };
      }

      // Convert locked seats to BOOKED permanently
      booking.seats.forEach((seat) => {
        const lockKey = `${booking.showId}_${seat.seatId}`;
        this.seatLocks.set(lockKey, {
          showId: booking.showId,
          seatId: seat.seatId,
          userId: booking.userId,
          bookingId: booking._id,
          status: 'CONVERTED_TO_BOOKING',
          lockedAt: booking.createdAt,
          lockExpiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // Permanent
        });
      });

      booking.bookingStatus = 'CONFIRMED';
      booking.paymentStatus = 'PAID';
      booking.paymentId = paymentId || `pay_sim_${Date.now()}`;
      booking.orderId = orderId || booking.orderId;
      booking.updatedAt = now;

      return booking;
    });
  }

  // Cancel booking
  async cancelBooking(bookingId, userId) {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw { status: 404, message: 'Booking not found' };

    if (String(booking.userId) !== String(userId)) {
      throw { status: 403, message: 'Not authorized to cancel this booking' };
    }

    if (booking.bookingStatus !== 'CONFIRMED') {
      throw { status: 400, message: 'Only confirmed bookings can be cancelled' };
    }

    return this.withShowMutex(booking.showId, async () => {
      // Release seats
      booking.seats.forEach((seat) => {
        const lockKey = `${booking.showId}_${seat.seatId}`;
        this.seatLocks.delete(lockKey);
      });

      booking.bookingStatus = 'CANCELLED';
      booking.paymentStatus = 'REFUNDED';
      booking.updatedAt = new Date();

      return booking;
    });
  }
}

export const dataStore = new DataStore();
export default dataStore;
