import express from 'express';
import { getShowSeats, lockSeats, releaseSeats } from '../controllers/seatController.js';
import { protect } from '../middleware/authMiddleware.js';

// Router mounted at both /api/shows/:showId and /api/seats
const router = express.Router({ mergeParams: true });

router.get('/seats', (req, res, next) => {
  // Optional auth to detect user's own locks
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => getShowSeats(req, res, next));
  }
  return getShowSeats(req, res, next);
});

router.post('/lock-seats', protect, lockSeats);
router.post('/release-seats', protect, releaseSeats);

export default router;
