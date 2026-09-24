import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true }, // e.g. "A1"
  row: { type: String, required: true },        // e.g. "A"
  column: { type: Number, required: true },     // e.g. 1
  category: {
    type: String,
    enum: ['REGULAR', 'PREMIUM', 'RECLINER'],
    default: 'REGULAR',
  },
  priceMultiplier: { type: Number, default: 1.0 },
});

const screenSchema = new mongoose.Schema(
  {
    cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
    name: { type: String, required: true }, // e.g. "Screen 1 - IMAX Laser"
    screenNumber: { type: Number, required: true },
    rows: { type: Number, required: true },
    seatsPerRow: { type: Number, required: true },
    seatLayout: [seatSchema],
  },
  { timestamps: true }
);

export const Screen = mongoose.models.Screen || mongoose.model('Screen', screenSchema);
export default Screen;
