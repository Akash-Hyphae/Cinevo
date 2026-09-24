import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'cinevo_super_secret_jwt_key_2026_x9k2p',
  jwtExpiresIn: '7d',
  lockDurationMs: 5 * 60 * 1000, // 5 minutes exactly
  emailVerificationExpiresMs: 30 * 60 * 1000, // 30 minutes
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_cinevo_sandbox_key',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'cinevo_secret_sandbox_signature_token',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
};
