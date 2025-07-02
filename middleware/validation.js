const { body, param } = require('express-validator');

class ValidationMiddleware {
  // Registration validation
  validateRegister = [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
  ];

  // Login validation
  validateLogin = [
    body('identifier')
      .trim()
      .notEmpty()
      .withMessage('Email or username is required'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];

  // Email validation
  validateEmail = [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ];

  // Password reset validation
  validatePasswordReset = [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
  ];

  // Profile update validation
  validateProfileUpdate = [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('profilePicture')
      .optional()
      .isURL()
      .withMessage('Profile picture must be a valid URL')
  ];

  // Change password validation
  validateChangePassword = [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('New password must be different from current password');
        }
        return true;
      })
  ];

  // Delete account validation
  validateDeleteAccount = [
    body('password')
      .notEmpty()
      .withMessage('Password is required to delete account')
  ];

  // Token parameter validation
  validateToken = [
    param('token')
      .isLength({ min: 32, max: 128 })
      .withMessage('Invalid token format')
      .matches(/^[a-f0-9]+$/)
      .withMessage('Token must contain only hexadecimal characters')
  ];

  // MongoDB ObjectId validation
  validateObjectId = (paramName = 'id') => [
    param(paramName)
      .isMongoId()
      .withMessage('Invalid ID format')
  ];

  // Pagination validation
  validatePagination = [
    body('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    body('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ];
}

module.exports = new ValidationMiddleware();