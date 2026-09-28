// Unknown route -> 404
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// One place that turns any thrown error into a JSON response.
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Bad ObjectId in the URL
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid id format';
  }

  // Mongoose validation failure
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Duplicate key, for example an email that already exists
  if (err.code === 11000) {
    statusCode = 400;
    message = `${Object.keys(err.keyValue).join(', ')} already exists`;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized, invalid or expired token';
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
