import express from 'express';
import {
  getDashboardStats,
  createMovie,
  updateMovie,
  deleteMovie,
  createShow,
  deleteShow,
  runConcurrencyTest,
  getMongoStatus,
  seedMongoData,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);
router.post('/shows', createShow);
router.delete('/shows/:id', deleteShow);

// Concurrency race condition test runner
router.post('/test-concurrency', runConcurrencyTest);

// MongoDB Status & Huge Dataset Seeder
router.get('/mongo-status', getMongoStatus);
router.post('/seed-mongodb', seedMongoData);

export default router;
