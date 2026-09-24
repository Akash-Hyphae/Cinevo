import dataStore from '../db/dataStore.js';

export const getShowSeats = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const currentUserId = req.user ? req.user._id : null;

    const show = dataStore.shows.get(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const screen = dataStore.screens.get(show.screenId);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen layout not found' });
    }

    // Dynamic seat evaluation with strict TTL expiration
    let userActiveLockExpiresAt = null;
    const mySelectedSeatIds = [];

    const seatMatrix = screen.seatLayout.map((seat) => {
      const state = dataStore.getSeatState(showId, seat.seatId, currentUserId);
      const categoryPrice = show.pricing[seat.category] || 220;

      if (state.status === 'SELECTED_BY_ME') {
        mySelectedSeatIds.push(seat.seatId);
        if (!userActiveLockExpiresAt || new Date(state.expiresAt) > new Date(userActiveLockExpiresAt)) {
          userActiveLockExpiresAt = state.expiresAt;
        }
      }

      return {
        seatId: seat.seatId,
        seatNumber: seat.seatNumber,
        row: seat.row,
        column: seat.column,
        category: seat.category,
        price: categoryPrice,
        status: state.status, // AVAILABLE | SELECTED_BY_ME | LOCKED | BOOKED
        remainingSeconds: state.remainingSeconds || null,
      };
    });

    const now = new Date();
    const remainingSeconds = userActiveLockExpiresAt
      ? Math.max(0, Math.floor((new Date(userActiveLockExpiresAt).getTime() - now.getTime()) / 1000))
      : 0;

    res.json({
      success: true,
      data: {
        showId,
        screenName: screen.name,
        pricing: show.pricing,
        seats: seatMatrix,
        myLockedSeats: mySelectedSeatIds,
        lockExpiresAt: userActiveLockExpiresAt,
        remainingSeconds,
        serverTime: now,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const lockSeats = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const { seatIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one seat to reserve.',
      });
    }

    if (seatIds.length > 8) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 8 seats can be reserved in a single transaction.',
      });
    }

    // Atomic multi-seat lock
    const lockResult = await dataStore.lockSeatsAtomically({
      showId,
      seatIds,
      userId,
    });

    res.status(200).json({
      success: true,
      message: 'Seats temporarily reserved for 5 minutes.',
      data: lockResult,
    });
  } catch (error) {
    next(error);
  }
};

export const releaseSeats = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const { seatIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(seatIds)) {
      return res.status(400).json({ success: false, message: 'seatIds array required' });
    }

    await dataStore.releaseSeats({ showId, seatIds, userId });

    res.json({
      success: true,
      message: 'Seats released successfully.',
    });
  } catch (error) {
    next(error);
  }
};
