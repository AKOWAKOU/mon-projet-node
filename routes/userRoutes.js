const express = require('express');
const rateLimit = require('express-rate-limit');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');
const validation = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

class UserRoutes {
  constructor() {
    this.router = express.Router();
    this.userController = new UserController();
    this.setupRateLimiting();
    this.setupRoutes();
  }

  setupRateLimiting() {
    // Rate limiting for sensitive operations
    this.sensitiveOpLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 3, // 3 requests per window
      message: {
        success: false,
        message: 'Too many sensitive operations, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });

    // Rate limiting for profile updates
    this.updateLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 updates per hour
      message: {
        success: false,
        message: 'Too many profile updates, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  setupRoutes() {
    // All routes require authentication
    this.router.use(authMiddleware.authenticate);

    // GET /api/users/profile - Get current user profile
    this.router.get(
      '/profile',
      asyncHandler(this.userController.getProfile)
    );

    // PUT /api/users/profile - Update user profile
    this.router.put(
      '/profile',
      this.updateLimiter,
      validation.validateProfileUpdate,
      asyncHandler(this.userController.updateProfile)
    );

    // POST /api/users/change-password - Change password
    this.router.post(
      '/change-password',
      this.sensitiveOpLimiter,
      validation.validateChangePassword,
      asyncHandler(this.userController.changePassword)
    );

    // DELETE /api/users/account - Delete user account
    this.router.delete(
      '/account',
      this.sensitiveOpLimiter,
      validation.validateDeleteAccount,
      asyncHandler(this.userController.deleteAccount)
    );

    // Admin-only routes
    this.router.use(authMiddleware.requireAdmin);

    // GET /api/users - Get all users (admin only)
    this.router.get(
      '/',
      validation.validatePagination,
      asyncHandler(this.userController.getAllUsers)
    );

    // GET /api/users/:id - Get user by ID (admin only)
    this.router.get(
      '/:id',
      validation.validateObjectId('id'),
      asyncHandler(this.userController.getUserById)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = new UserRoutes().getRouter();