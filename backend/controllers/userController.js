// MEMBER 4 - User management (admin only)
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/users?role=
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: users });
});

// PUT /api/users/:id/block - blocks or unblocks an account
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user._id.equals(req.user._id)) {
    res.status(400);
    throw new Error('You cannot block your own account');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: user.isActive ? 'User unblocked' : 'User blocked',
    data: { _id: user._id, name: user.name, isActive: user.isActive },
  });
});

module.exports = { getUsers, toggleBlockUser };
