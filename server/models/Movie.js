import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    poster: { type: String, required: true },
    backdrop: { type: String, required: true },
    trailerUrl: { type: String, default: '' },
    duration: { type: Number, required: true }, // in minutes
    language: { type: String, required: true },
    genres: [{ type: String, required: true }],
    certificate: { type: String, enum: ['U', 'UA', 'A', 'R', 'PG-13'], default: 'UA' },
    releaseDate: { type: Date, required: true },
    cast: [{ type: String }],
    director: { type: String, required: true },
    rating: { type: Number, default: 8.5, min: 0, max: 10 },
    status: {
      type: String,
      enum: ['UPCOMING', 'NOW_SHOWING', 'ENDED'],
      default: 'NOW_SHOWING',
    },
  },
  { timestamps: true }
);

export const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
export default Movie;
