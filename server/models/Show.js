import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema({
  REGULAR: { type: Number, required: true, default: 220 },
  PREMIUM: { type: Number, required: true, default: 350 },
  RECLINER: { type: Number, required: true, default: 550 },
});

const showSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    cinemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
    screenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    language: { type: String, required: true },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: '2D',
    },
    pricing: { type: pricingSchema, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'CANCELLED', 'COMPLETED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export const Show = mongoose.models.Show || mongoose.model('Show', showSchema);
export default Show;
