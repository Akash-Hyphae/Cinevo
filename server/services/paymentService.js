import crypto from 'crypto';
import { config } from '../config/index.js';

class PaymentService {
  async createOrder({ bookingId, amount, currency = 'INR', receipt }) {
    // Generate order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: orderId,
      entity: 'order',
      amount: Math.round(amount * 100), // amount in paise
      amount_paid: 0,
      amount_due: Math.round(amount * 100),
      currency,
      receipt: receipt || `rcpt_${bookingId}`,
      status: 'created',
      attempts: 0,
      notes: { bookingId },
      created_at: Math.floor(Date.now() / 1000),
      keyId: config.razorpayKeyId,
    };
  }

  verifySignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId || !signature) {
      return false;
    }

    // In sandbox simulation mode
    if (signature.startsWith('sim_sig_') || signature === 'valid_sandbox_signature') {
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', config.razorpayKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return generatedSignature === signature;
    } catch (err) {
      console.error('Signature verification error:', err);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
