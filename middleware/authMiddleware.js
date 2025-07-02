const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthMiddleware {
  // Verify JWT token
  authenticate = async (req, res, next) => {
    try {
      const authHeader = req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      
      // Check if user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is no longer valid'
        });
      }

      // Check if user's email is confirmed
      if (!user.isEmailConfirmed) {
        return res.status(401).json({
          success: false,
          message: 'Please confirm your email to access this resource'
        });
      }

      // Add user info to request
      req.user = {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }

      console.error('Authentication error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during authentication'
      });
    }
  }

  // Check if user is admin
  requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  }

  // Optional authentication (doesn't fail if no token)
  optionalAuth = async (req, res, next) => {
    try {
      const authHeader = req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      
      const user = await User.findById(decoded.userId);
      if (user && user.isEmailConfirmed) {
        req.user = {
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        };
      }

      next();
    } catch (error) {
      // Don't fail, just continue without authentication
      next();
    }
  }

  // Check if user owns the resource or is admin
  requireOwnershipOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
      const resourceId = req.params[paramName];
      
      if (req.user.role === 'admin' || req.user.userId.toString() === resourceId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    };
  }
}

module.exports = new AuthMiddleware();