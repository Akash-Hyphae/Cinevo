import express from 'express';
import { getPaymentConfig, createPaymentOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/config', protect, getPaymentConfig);
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);

export default router;
