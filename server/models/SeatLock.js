import mongoose from 'mongoose';

const seatLockSchema = new mongoose.Schema(
  {
    showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true, index: true },
    seatId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    status: {
      type: String,
      enum: ['LOCKED', 'RELEASED', 'CONVERTED_TO_BOOKING'],
      default: 'LOCKED',
    },
    lockedAt: { type: Date, default: Date.now },
    lockExpiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of lock for a show's seat
seatLockSchema.index({ showId: 1, seatId: 1 });
// TTL index for automatic document expiration in MongoDB
seatLockSchema.index({ lockExpiresAt: 1 }, { expireAfterSeconds: 0 });

export const SeatLock = mongoose.models.SeatLock || mongoose.model('SeatLock', seatLockSchema);
export default SeatLock;
