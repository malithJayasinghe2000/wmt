// MEMBER 2 - Doctor time slots (schedules)
const Schedule = require('../models/Schedule');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const todayString = () => new Date().toISOString().split('T')[0];

// Finds the doctor profile of a logged-in doctor account
const doctorProfileOf = async (user) => Doctor.findOne({ userId: user._id });

// GET /api/schedules?doctorId=&date=&free=true
const getSchedules = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.doctorId) filter.doctorId = req.query.doctorId;
  if (req.query.date) filter.date = req.query.date;
  if (req.query.free === 'true') filter.isBooked = false;

  // A doctor asking without a doctorId sees only their own slots
  if (!req.query.doctorId && req.user.role === 'doctor') {
    const profile = await doctorProfileOf(req.user);
    if (!profile) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }
    filter.doctorId = profile._id;
  }

  const slots = await Schedule.find(filter).sort({ date: 1, startTime: 1 });
  res.json({ success: true, count: slots.length, data: slots });
});

// POST /api/schedules  (doctor or admin)
const createSchedule = asyncHandler(async (req, res) => {
  let { doctorId, date, startTime, endTime } = req.body;

  if (req.user.role === 'doctor') {
    const profile = await doctorProfileOf(req.user);
    if (!profile) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }
    doctorId = profile._id; // a doctor can only add slots to themselves
  }

  if (!doctorId || !date || !startTime || !endTime) {
    res.status(400);
    throw new Error('Doctor, date, start time and end time are required');
  }
  if (date < todayString()) {
    res.status(400);
    throw new Error('Cannot create a slot in the past');
  }
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    res.status(400);
    throw new Error('End time must be after start time');
  }

  const doctorExists = await Doctor.findById(doctorId);
  if (!doctorExists) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  // Overlap check: two slots clash when each starts before the other ends
  const sameDay = await Schedule.find({ doctorId, date });
  const clash = sameDay.find(
    (s) => toMinutes(startTime) < toMinutes(s.endTime) && toMinutes(s.startTime) < toMinutes(endTime)
  );
  if (clash) {
    res.status(400);
    throw new Error(`This clashes with an existing slot ${clash.startTime} - ${clash.endTime}`);
  }

  const slot = await Schedule.create({ doctorId, date, startTime, endTime });
  res.status(201).json({ success: true, message: 'Time slot created', data: slot });
});

// PUT /api/schedules/:id  (doctor or admin)
const updateSchedule = asyncHandler(async (req, res) => {
  const slot = await Schedule.findById(req.params.id);
  if (!slot) {
    res.status(404);
    throw new Error('Time slot not found');
  }
  if (slot.isBooked) {
    res.status(400);
    throw new Error('A booked slot cannot be changed');
  }

  const date = req.body.date || slot.date;
  const startTime = req.body.startTime || slot.startTime;
  const endTime = req.body.endTime || slot.endTime;

  if (toMinutes(endTime) <= toMinutes(startTime)) {
    res.status(400);
    throw new Error('End time must be after start time');
  }

  const sameDay = await Schedule.find({ doctorId: slot.doctorId, date, _id: { $ne: slot._id } });
  const clash = sameDay.find(
    (s) => toMinutes(startTime) < toMinutes(s.endTime) && toMinutes(s.startTime) < toMinutes(endTime)
  );
  if (clash) {
    res.status(400);
    throw new Error(`This clashes with an existing slot ${clash.startTime} - ${clash.endTime}`);
  }

  slot.date = date;
  slot.startTime = startTime;
  slot.endTime = endTime;
  await slot.save();

  res.json({ success: true, message: 'Time slot updated', data: slot });
});

// DELETE /api/schedules/:id  (doctor or admin)
const deleteSchedule = asyncHandler(async (req, res) => {
  const slot = await Schedule.findById(req.params.id);
  if (!slot) {
    res.status(404);
    throw new Error('Time slot not found');
  }
  if (slot.isBooked) {
    res.status(400);
    throw new Error('A booked slot cannot be deleted');
  }
  await slot.deleteOne();
  res.json({ success: true, message: 'Time slot deleted' });
});

module.exports = { getSchedules, createSchedule, updateSchedule, deleteSchedule };
