class ErrorHandler {
  // Main error handler middleware
  errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    // Log error for debugging
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = this.handleValidationError(error);
    } else if (error.name === 'CastError') {
      statusCode = 400;
      message = this.handleCastError(error);
    } else if (error.code === 11000) {
      statusCode = 409;
      message = this.handleDuplicateError(error);
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    // Send error response
    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        error: error 
      })
    });
  }

  // Handle MongoDB validation errors
  handleValidationError(error) {
    const errors = Object.values(error.errors).map(err => err.message);
    return `Validation Error: ${errors.join(', ')}`;
  }

  // Handle MongoDB cast errors
  handleCastError(error) {
    return `Invalid ${error.path}: ${error.value}`;
  }

  // Handle MongoDB duplicate key errors
  handleDuplicateError(error) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return `${field} '${value}' already exists`;
  }

  // Handle async errors wrapper
  asyncHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Custom error class
  createError(message, statusCode = 500) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  // 404 handler
  notFoundHandler = (req, res, next) => {
    const error = this.createError(`Route ${req.originalUrl} not found`, 404);
    next(error);
  }
}

module.exports = new ErrorHandler();