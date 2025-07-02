const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailService = require('../services/EmailService');
const { validationResult } = require('express-validator');

class AuthController {
  constructor() {
    this.emailService = new EmailService();
  }

  // Register new user
  register = async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmailOrUsername(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email or username'
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password
      });

      // Generate email confirmation token
      const confirmationToken = user.generateEmailConfirmationToken();
      await user.save();

      // Send confirmation email
      await this.emailService.sendConfirmationEmail(user.email, confirmationToken);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to confirm your account.',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            isEmailConfirmed: user.isEmailConfirmed
          }
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  // Login user
  login = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { identifier, password } = req.body;

      // Find user by email or username
      const user = await User.findByEmailOrUsername(identifier);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if email is confirmed
      if (!user.isEmailConfirmed) {
        return res.status(401).json({
          success: false,
          message: 'Please confirm your email before logging in'
        });
      }

      // Generate JWT token
      const token = this.generateToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  // Confirm email
  confirmEmail = async (req, res) => {
    try {
      const { token } = req.params;

      const user = await User.findOne({ emailConfirmationToken: token });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired confirmation token'
        });
      }

      user.isEmailConfirmed = true;
      user.emailConfirmationToken = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Email confirmed successfully'
      });

    } catch (error) {
      console.error('Email confirmation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during email confirmation'
      });
    }
  }

  // Request password reset
  requestPasswordReset = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Don't reveal whether user exists or not
        return res.status(200).json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }

      // Generate password reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send password reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during password reset request'
      });
    }
  }

  // Reset password
  resetPassword = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset token'
        });
      }

      // Update password
      user.password = password;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during password reset'
      });
    }
  }

  // Resend confirmation email
  resendConfirmation = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isEmailConfirmed) {
        return res.status(400).json({
          success: false,
          message: 'Email is already confirmed'
        });
      }

      // Generate new confirmation token
      const confirmationToken = user.generateEmailConfirmationToken();
      await user.save();

      // Send confirmation email
      await this.emailService.sendConfirmationEmail(user.email, confirmationToken);

      res.status(200).json({
        success: true,
        message: 'Confirmation email sent successfully'
      });

    } catch (error) {
      console.error('Resend confirmation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while resending confirmation'
      });
    }
  }

  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = AuthController;