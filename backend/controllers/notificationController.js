// MEMBER 5 - Notifications
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/notifications  (own only)
const getNotifications = asyncHandler(async (req, res) => {
  const list = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unread = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.json({ success: true, count: list.length, unread, data: list });
});

// PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const item = await Notification.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Notification not found');
  }
  if (!item.userId.equals(req.user._id)) {
    res.status(403);
    throw new Error('This notification is not yours');
  }
  item.isRead = true;
  await item.save();
  res.json({ success: true, message: 'Marked as read', data: item });
});

module.exports = { getNotifications, markAsRead };
