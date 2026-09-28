const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Protects a route: the request must carry a valid JWT.
// Header format: Authorization: Bearer <token>
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('Not authorized, user no longer exists');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been blocked. Contact the clinic admin.');
  }

  req.user = user;
  next();
});

module.exports = { protect };
