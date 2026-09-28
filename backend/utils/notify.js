const Notification = require('../models/Notification');

// Creates an in-app notification. Called whenever an appointment
// or a prescription changes, so the other side sees it.
const notify = async (userId, message, type = 'general', relatedId = null) => {
  try {
    await Notification.create({ userId, message, type, relatedId });
  } catch (error) {
    console.error('Notification failed:', error.message);
  }
};

module.exports = notify;
