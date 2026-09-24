import mongoose from 'mongoose';

const bookedSeatItemSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  seatNumber: { type: String, required: true },
  row: { type: String, required: true },
  column: { type: Number, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    seats: [bookedSeatItemSchema],
    ticketAmount: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    convenienceFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    bookingStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED', 'EXPIRED'],
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paymentId: { type: String, default: null },
    orderId: { type: String, default: null },
    idempotencyKey: { type: String, index: true, sparse: true },
    bookingReference: { type: String, required: true, unique: true },
    lockExpiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
