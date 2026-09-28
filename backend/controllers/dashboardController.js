// MEMBER 4 - Admin dashboard counts
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard/stats  (admin)
const getStats = asyncHandler(async (req, res) => {
  const [patients, doctors, pending, confirmed, completed, total] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    Doctor.countDocuments(),
    Appointment.countDocuments({ status: 'Pending' }),
    Appointment.countDocuments({ status: 'Confirmed' }),
    Appointment.countDocuments({ status: 'Completed' }),
    Appointment.countDocuments(),
  ]);

  res.json({
    success: true,
    data: { patients, doctors, pending, confirmed, completed, totalAppointments: total },
  });
});

module.exports = { getStats };
