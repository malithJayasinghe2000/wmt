// MEMBER 3 - Patient booking  |  MEMBER 4 - Doctor/admin approval
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');

const populateAll = (query) =>
  query
    .populate('patientId', 'name email phone')
    .populate({
      path: 'doctorId',
      populate: [
        { path: 'userId', select: 'name email' },
        { path: 'specializationId', select: 'name' },
      ],
    })
    .populate('scheduleId');

// ---------- MEMBER 3 ----------

// POST /api/appointments  (patient)
const createAppointment = asyncHandler(async (req, res) => {
  const { scheduleId, reason, attachment } = req.body;

  if (!scheduleId || !reason) {
    res.status(400);
    throw new Error('Time slot and reason are required');
  }

  const slot = await Schedule.findById(scheduleId);
  if (!slot) {
    res.status(404);
    throw new Error('Time slot not found');
  }
  if (slot.isBooked) {
    res.status(400);
    throw new Error('This slot has already been booked');
  }
  if (slot.date < new Date().toISOString().split('T')[0]) {
    res.status(400);
    throw new Error('Cannot book a slot in the past');
  }

  const appointment = await Appointment.create({
    patientId: req.user._id,
    doctorId: slot.doctorId,
    scheduleId: slot._id,
    reason,
    attachment: attachment || '',
  });

  // Lock the slot so nobody else can take it
  slot.isBooked = true;
  await slot.save();

  const doctor = await Doctor.findById(slot.doctorId);
  if (doctor) {
    await notify(
      doctor.userId,
      `New appointment request from ${req.user.name} on ${slot.date} at ${slot.startTime}`,
      'appointment',
      appointment._id
    );
  }

  const populated = await populateAll(Appointment.findById(appointment._id));
  res.status(201).json({ success: true, message: 'Appointment requested', data: populated });
});

// GET /api/appointments/my  (patient)
const getMyAppointments = asyncHandler(async (req, res) => {
  const filter = { patientId: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const list = await populateAll(Appointment.find(filter)).sort({ createdAt: -1 });
  res.json({ success: true, count: list.length, data: list });
});

// GET /api/appointments/:id  (owner, the doctor of it, or admin)
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await populateAll(Appointment.findById(req.params.id));
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const isOwner = appointment.patientId._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  const isTheDoctor =
    req.user.role === 'doctor' &&
    appointment.doctorId &&
    appointment.doctorId.userId &&
    appointment.doctorId.userId._id.equals(req.user._id);

  if (!isOwner && !isAdmin && !isTheDoctor) {
    res.status(403);
    throw new Error('You cannot view this appointment');
  }

  res.json({ success: true, data: appointment });
});

// PUT /api/appointments/:id/cancel  (patient)
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  if (!appointment.patientId.equals(req.user._id)) {
    res.status(403);
    throw new Error('You can only cancel your own appointment');
  }
  if (!['Pending', 'Confirmed'].includes(appointment.status)) {
    res.status(400);
    throw new Error(`A ${appointment.status.toLowerCase()} appointment cannot be cancelled`);
  }

  appointment.status = 'Cancelled';
  await appointment.save();

  // Free the slot again
  await Schedule.findByIdAndUpdate(appointment.scheduleId, { isBooked: false });

  const doctor = await Doctor.findById(appointment.doctorId);
  if (doctor) {
    await notify(doctor.userId, `${req.user.name} cancelled an appointment`, 'appointment', appointment._id);
  }

  res.json({ success: true, message: 'Appointment cancelled', data: appointment });
});

// ---------- MEMBER 4 ----------

// GET /api/appointments?status=&date=  (doctor sees own, admin sees all)
const getAllAppointments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  if (req.user.role === 'doctor') {
    const profile = await Doctor.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }
    filter.doctorId = profile._id;
  } else if (req.query.doctorId) {
    filter.doctorId = req.query.doctorId;
  }

  let list = await populateAll(Appointment.find(filter)).sort({ createdAt: -1 });

  // Filter by slot date, which lives in the populated schedule
  if (req.query.date) {
    list = list.filter((a) => a.scheduleId && a.scheduleId.date === req.query.date);
  }

  res.json({ success: true, count: list.length, data: list });
});

// PUT /api/appointments/:id/status  (doctor or admin)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['Confirmed', 'Rejected', 'Completed'];

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(', ')}`);
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // A doctor may only touch their own appointments
  if (req.user.role === 'doctor') {
    const profile = await Doctor.findOne({ userId: req.user._id });
    if (!profile || !appointment.doctorId.equals(profile._id)) {
      res.status(403);
      throw new Error('You can only manage your own appointments');
    }
  }

  if (['Cancelled', 'Rejected'].includes(appointment.status)) {
    res.status(400);
    throw new Error(`A ${appointment.status.toLowerCase()} appointment cannot be changed`);
  }
  if (status === 'Completed' && appointment.status !== 'Confirmed') {
    res.status(400);
    throw new Error('Only a confirmed appointment can be marked completed');
  }

  appointment.status = status;
  await appointment.save();

  // A rejected appointment releases its slot
  if (status === 'Rejected') {
    await Schedule.findByIdAndUpdate(appointment.scheduleId, { isBooked: false });
  }

  await notify(
    appointment.patientId,
    `Your appointment was ${status.toLowerCase()}`,
    'appointment',
    appointment._id
  );

  const populated = await populateAll(Appointment.findById(appointment._id));
  res.json({ success: true, message: `Appointment ${status.toLowerCase()}`, data: populated });
});

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
};
