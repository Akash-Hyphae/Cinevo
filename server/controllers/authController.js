import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import dataStore from '../db/dataStore.js';
import emailService from '../services/emailService.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check existing email
    for (const u of dataStore.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = emailService.generateToken();
    const verificationExpires = new Date(Date.now() + config.emailVerificationExpiresMs);

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newUser = {
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dataStore.users.set(userId, newUser);

    // Send verification email
    await emailService.sendVerificationEmail(newUser, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        userId: newUser._id,
        email: newUser.email,
        name: newUser.name,
        verificationToken, // Provided for instant dev testing
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    let matchedUser = null;
    const now = new Date();

    for (const u of dataStore.users.values()) {
      if (u.emailVerificationToken === token) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }

    if (matchedUser.emailVerificationExpires && new Date(matchedUser.emailVerificationExpires) < now) {
      return res.status(400).json({ success: false, message: 'Verification token has expired. Please request a new one.' });
    }

    matchedUser.isEmailVerified = true;
    matchedUser.emailVerificationToken = null;
    matchedUser.emailVerificationExpires = null;
    matchedUser.updatedAt = now;

    const authToken = generateToken(matchedUser._id, matchedUser.role);

    res.json({
      success: true,
      message: 'Email successfully verified! Welcome to Cinevo.',
      data: {
        token: authToken,
        user: {
          _id: matchedUser._id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          isEmailVerified: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    let matchedUser = null;
    for (const u of dataStore.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (matchedUser.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified. Please login.' });
    }

    const verificationToken = emailService.generateToken();
    matchedUser.emailVerificationToken = verificationToken;
    matchedUser.emailVerificationExpires = new Date(Date.now() + config.emailVerificationExpiresMs);
    matchedUser.updatedAt = new Date();

    await emailService.sendVerificationEmail(matchedUser, verificationToken);

    res.json({
      success: true,
      message: 'A new verification link has been sent to your email.',
      verificationToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    let matchedUser = null;
    for (const u of dataStore.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, matchedUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!matchedUser.isEmailVerified) {
      return res.status(403).json({
        success: false,
        isEmailUnverified: true,
        email: matchedUser.email,
        message: 'Please verify your email address before logging in.',
      });
    }

    const token = generateToken(matchedUser._id, matchedUser.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: matchedUser._id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          isEmailVerified: matchedUser.isEmailVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    let matchedUser = null;
    for (const u of dataStore.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(404).json({ success: false, message: 'No account with that email was found.' });
    }

    const resetToken = emailService.generateToken();
    matchedUser.resetPasswordToken = resetToken;
    matchedUser.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    matchedUser.updatedAt = new Date();

    await emailService.sendPasswordResetEmail(matchedUser, resetToken);

    res.json({
      success: true,
      message: 'Password reset link sent to your email.',
      resetToken, // For testing convenience
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid token and minimum 6-character password required.' });
    }

    let matchedUser = null;
    const now = new Date();

    for (const u of dataStore.users.values()) {
      if (u.resetPasswordToken === token) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser || (matchedUser.resetPasswordExpires && new Date(matchedUser.resetPasswordExpires) < now)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    matchedUser.password = await bcrypt.hash(newPassword, 10);
    matchedUser.resetPasswordToken = null;
    matchedUser.resetPasswordExpires = null;
    matchedUser.updatedAt = now;

    res.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};

export const getMailbox = async (req, res) => {
  res.json({
    success: true,
    data: dataStore.emailVerificationMailbox,
  });
};
