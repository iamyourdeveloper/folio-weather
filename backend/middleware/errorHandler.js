// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  // Normalize error fields from various sources
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Server Error';

  // Log full error for diagnosis
  console.error('Global Error Handler:', {
    message: err.message,
    status: err.status,
    statusCode: err.statusCode,
    stack: err.stack,
  });

  let normalized = { statusCode, message };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    normalized = { statusCode: 404, message: 'Resource not found' };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    normalized = { statusCode: 400, message: 'Duplicate field value entered' };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(val => val.message).join(', ');
    normalized = { statusCode: 400, message: msg };
  }

  res.status(normalized.statusCode).json({
    success: false,
    error: normalized.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async handler to avoid try-catch in controllers
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
