import QRCode from 'qrcode';
import dataStore from '../db/dataStore.js';

export const createBooking = async (req, res, next) => {
  try {
    const { showId, seats, idempotencyKey } = req.body;
    const userId = req.user._id;

    if (!showId || !seats || !seats.length) {
      return res.status(400).json({ success: false, message: 'Invalid booking data provided' });
    }

    const booking = await dataStore.createBooking({
      userId,
      showId,
      seats,
      idempotencyKey,
    });

    res.status(201).json({
      success: true,
      message: 'Booking summary created. Proceed to payment.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = dataStore.bookings.get(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    if (String(booking.userId) !== String(req.user._id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const show = dataStore.shows.get(booking.showId);
    const movie = show ? dataStore.movies.get(show.movieId) : null;
    const cinema = show ? dataStore.cinemas.get(show.cinemaId) : null;
    const screen = show ? dataStore.screens.get(show.screenId) : null;

    // Generate dynamic QR Code Data URL for ticket entry
    const qrPayload = JSON.stringify({
      brand: 'CINEVO',
      reference: booking.bookingReference,
      bookingId: booking._id,
      showTime: show ? show.startTime : null,
      seats: booking.seats.map(s => s.seatId),
      cinema: cinema ? cinema.name : '',
    });

    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    } catch (e) {
      console.warn('QR code generation warning:', e);
    }

    res.json({
      success: true,
      data: {
        ...booking,
        qrCode: qrCodeDataUrl,
        movie: movie ? {
          title: movie.title,
          poster: movie.poster,
          backdrop: movie.backdrop,
          duration: movie.duration,
          certificate: movie.certificate,
          language: movie.language,
        } : null,
        cinema: cinema ? {
          name: cinema.name,
          address: cinema.address,
          city: cinema.city,
        } : null,
        screen: screen ? {
          name: screen.name,
          screenNumber: screen.screenNumber,
        } : null,
        show: show ? {
          startTime: show.startTime,
          endTime: show.endTime,
          format: show.format,
          language: show.language,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const userBookings = Array.from(dataStore.bookings.values())
      .filter(b => String(b.userId) === String(userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const enriched = userBookings.map(b => {
      const show = dataStore.shows.get(b.showId);
      const movie = show ? dataStore.movies.get(show.movieId) : null;
      const cinema = show ? dataStore.cinemas.get(show.cinemaId) : null;
      const screen = show ? dataStore.screens.get(show.screenId) : null;

      return {
        ...b,
        movieTitle: movie ? movie.title : 'Movie',
        moviePoster: movie ? movie.poster : '',
        movieDuration: movie ? movie.duration : 120,
        movieCertificate: movie ? movie.certificate : 'UA',
        cinemaName: cinema ? cinema.name : 'Cinevo Cinema',
        cinemaCity: cinema ? cinema.city : '',
        screenName: screen ? screen.name : 'Screen 1',
        showStartTime: show ? show.startTime : null,
        showFormat: show ? show.format : '2D',
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const updatedBooking = await dataStore.cancelBooking(id, userId);

    res.json({
      success: true,
      message: 'Booking cancelled successfully and seats released.',
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};
