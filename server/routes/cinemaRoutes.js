import express from 'express';
import { getCinemas, getCinemaById, getCities } from '../controllers/cinemaController.js';

const router = express.Router();

router.get('/cities', getCities);
router.get('/', getCinemas);
router.get('/:id', getCinemaById);

export default router;
