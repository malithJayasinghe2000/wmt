// MEMBER 5 - Prescriptions
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');

const populateAll = (query) =>
  query
    .populate('patientId', 'name email')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
    .populate('appointmentId');

// POST /api/prescriptions  (doctor) - written after the visit
const createPrescription = asyncHandler(async (req, res) => {
  const { appointmentId, diagnosis, medicines, notes, reportFile } = req.body;

  if (!appointmentId || !diagnosis) {
    res.status(400);
    throw new Error('Appointment and diagnosis are required');
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const profile = await Doctor.findOne({ userId: req.user._id });
  if (!profile || !appointment.doctorId.equals(profile._id)) {
    res.status(403);
    throw new Error('You can only write prescriptions for your own appointments');
  }
  if (appointment.status !== 'Completed') {
    res.status(400);
    throw new Error('Mark the appointment as completed first');
  }

  const already = await Prescription.findOne({ appointmentId });
  if (already) {
    res.status(400);
    throw new Error('This appointment already has a prescription');
  }

  const prescription = await Prescription.create({
    appointmentId,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    diagnosis,
    medicines: Array.isArray(medicines) ? medicines : [],
    notes,
    reportFile: reportFile || '',
  });

  await notify(appointment.patientId, 'Your prescription is ready', 'prescription', prescription._id);

  const populated = await populateAll(Prescription.findById(prescription._id));
  res.status(201).json({ success: true, message: 'Prescription saved', data: populated });
});

// GET /api/prescriptions/my  (patient sees own, doctor sees the ones they wrote)
const getMyPrescriptions = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'doctor') {
    const profile = await Doctor.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404);
      throw new Error('Doctor profile not found');
    }
    filter.doctorId = profile._id;
  } else {
    filter.patientId = req.user._id;
  }

  const list = await populateAll(Prescription.find(filter)).sort({ createdAt: -1 });
  res.json({ success: true, count: list.length, data: list });
});

// GET /api/prescriptions/:id
const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await populateAll(Prescription.findById(req.params.id));
  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  const isOwner = prescription.patientId._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  const isTheDoctor =
    req.user.role === 'doctor' &&
    prescription.doctorId &&
    prescription.doctorId.userId &&
    prescription.doctorId.userId._id.equals(req.user._id);

  if (!isOwner && !isAdmin && !isTheDoctor) {
    res.status(403);
    throw new Error('You cannot view this prescription');
  }

  res.json({ success: true, data: prescription });
});

module.exports = { createPrescription, getMyPrescriptions, getPrescriptionById };
