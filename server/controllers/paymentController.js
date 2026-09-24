import paymentService from '../services/paymentService.js';
import dataStore from '../db/dataStore.js';

export const getPaymentConfig = async (req, res, next) => {
  try {
    const configData = paymentService.getConfig();
    res.json({
      success: true,
      data: configData,
    });
  } catch (error) {
    next(error);
  }
};

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = dataStore.bookings.get(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (String(booking.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized booking access' });
    }

    const now = new Date();
    if (new Date(booking.lockExpiresAt) <= now) {
      return res.status(410).json({
        success: false,
        message: 'Seat reservation expired. Please select your seats again.',
      });
    }

    const order = await paymentService.createOrder({
      bookingId: booking._id,
      amount: booking.totalAmount,
      currency: 'INR',
      receipt: booking.bookingReference,
    });

    booking.orderId = order.id;

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount, // in paise
        currency: order.currency,
        keyId: order.keyId,
        bookingReference: booking.bookingReference,
        totalAmount: booking.totalAmount,
        isOfficialRazorpay: order.isOfficialRazorpay,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, orderId, paymentId, signature, idempotencyKey } = req.body;

    if (!bookingId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters (bookingId or paymentId).',
      });
    }

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment signature for verification.',
      });
    }

    // Cryptographic signature verification
    const isValid = paymentService.verifySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Cryptographic signature verification failed. Transaction rejected.',
      });
    }

    // Atomically confirm booking and seats
    const confirmedBooking = await dataStore.confirmBookingPayment({
      bookingId,
      orderId,
      paymentId,
      signature,
      idempotencyKey,
    });

    res.json({
      success: true,
      message: 'Payment cryptographically verified and booking confirmed!',
      data: confirmedBooking,
    });
  } catch (error) {
    next(error);
  }
};
