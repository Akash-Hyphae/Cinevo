import mongoose from 'mongoose';

const cinemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    facilities: [{ type: String }], // e.g. ["Dolby Atmos", "Recliner Seats", "Parking", "Gourmet F&B"]
    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Screen' }],
  },
  { timestamps: true }
);

export const Cinema = mongoose.models.Cinema || mongoose.model('Cinema', cinemaSchema);
export default Cinema;
