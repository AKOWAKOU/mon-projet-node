const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/AuthController');
const validation = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthRoutes {
  constructor() {
    this.router = express.Router();
    this.authController = new AuthController();
    this.setupRateLimiting();
    this.setupRoutes();
  }

  setupRateLimiting() {
    // Rate limiting for authentication routes
    this.authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 requests per window
      message: {
        success: false,
        message: 'Too many authentication attempts, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });

    // Rate limiting for email-related routes
    this.emailLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 emails per hour
      message: {
        success: false,
        message: 'Too many email requests, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  setupRoutes() {
    // POST /api/auth/register - Register new user
    this.router.post(
      '/register',
      this.authLimiter,
      validation.validateRegister,
      asyncHandler(this.authController.register)
    );

    // POST /api/auth/login - Login user
    this.router.post(
      '/login',
      this.authLimiter,
      validation.validateLogin,
      asyncHandler(this.authController.login)
    );

    // GET /api/auth/confirm-email/:token - Confirm email address
    this.router.get(
      '/confirm-email/:token',
      validation.validateToken,
      asyncHandler(this.authController.confirmEmail)
    );

    // POST /api/auth/resend-confirmation - Resend confirmation email
    this.router.post(
      '/resend-confirmation',
      this.emailLimiter,
      validation.validateEmail,
      asyncHandler(this.authController.resendConfirmation)
    );

    // POST /api/auth/request-password-reset - Request password reset
    this.router.post(
      '/request-password-reset',
      this.emailLimiter,
      validation.validateEmail,
      asyncHandler(this.authController.requestPasswordReset)
    );

    // POST /api/auth/reset-password/:token - Reset password
    this.router.post(
      '/reset-password/:token',
      this.authLimiter,
      validation.validateToken,
      validation.validatePasswordReset,
      asyncHandler(this.authController.resetPassword)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = new AuthRoutes().getRouter();