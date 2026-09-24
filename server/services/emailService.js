import crypto from 'crypto';
import dataStore from '../db/dataStore.js';
import { config } from '../config/index.js';

class EmailService {
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(user, token) {
    const verificationUrl = `${config.clientUrl}/verify-email?token=${token}`;
    const emailRecord = {
      id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      to: user.email,
      type: 'VERIFY_EMAIL',
      subject: 'Verify your Cinevo account',
      token,
      url: verificationUrl,
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + config.emailVerificationExpiresMs),
    };

    // Store in mailbox for dev convenience / live preview
    dataStore.emailVerificationMailbox.unshift(emailRecord);
    if (dataStore.emailVerificationMailbox.length > 50) {
      dataStore.emailVerificationMailbox.pop();
    }

    console.log(`[CINEVO EMAIL] Verification email dispatched to ${user.email}: ${verificationUrl}`);
    return emailRecord;
  }

  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
    const emailRecord = {
      id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      to: user.email,
      type: 'RESET_PASSWORD',
      subject: 'Reset your Cinevo password',
      token,
      url: resetUrl,
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    };

    dataStore.emailVerificationMailbox.unshift(emailRecord);
    console.log(`[CINEVO EMAIL] Password reset email dispatched to ${user.email}: ${resetUrl}`);
    return emailRecord;
  }
}

export const emailService = new EmailService();
export default emailService;
