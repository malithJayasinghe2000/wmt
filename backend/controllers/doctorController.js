// MEMBER 1 - Doctor management (main entity CRUD)
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/doctors?specializationId=&q=   (any logged-in user)
const getDoctors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.specializationId) filter.specializationId = req.query.specializationId;
  if (req.query.available === 'true') filter.isAvailable = true;

  let doctors = await Doctor.find(filter)
    .populate('userId', 'name email phone avatar')
    .populate('specializationId', 'name icon')
    .sort({ createdAt: -1 });

  // Search by doctor name, done after populate because the name lives in User
  if (req.query.q) {
    const term = req.query.q.toLowerCase();
    doctors = doctors.filter((d) => d.userId && d.userId.name.toLowerCase().includes(term));
  }

  res.json({ success: true, count: doctors.length, data: doctors });
});

// GET /api/doctors/:id
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('userId', 'name email phone avatar')
    .populate('specializationId', 'name icon');

  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  res.json({ success: true, data: doctor });
});

// POST /api/doctors  (admin) - creates the login account and the profile together
const createDoctor = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone,
    specializationId, qualifications, experienceYears,
    consultationFee, photo, about,
  } = req.body;

  if (!name || !email || !password || !specializationId) {
    res.status(400);
    throw new Error('Name, email, password and specialization are required');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone, role: 'doctor' });

  const doctor = await Doctor.create({
    userId: user._id,
    specializationId,
    qualifications,
    experienceYears,
    consultationFee,
    photo,
    about,
  });

  const populated = await Doctor.findById(doctor._id)
    .populate('userId', 'name email phone avatar')
    .populate('specializationId', 'name icon');

  res.status(201).json({ success: true, message: 'Doctor created', data: populated });
});

// PUT /api/doctors/:id  (admin)
const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  const fields = [
    'specializationId', 'qualifications', 'experienceYears',
    'consultationFee', 'photo', 'about', 'isAvailable',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) doctor[f] = req.body[f];
  });
  await doctor.save();

  // Name and phone belong to the linked user account
  if (req.body.name || req.body.phone !== undefined) {
    const user = await User.findById(doctor.userId);
    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      await user.save();
    }
  }

  const populated = await Doctor.findById(doctor._id)
    .populate('userId', 'name email phone avatar')
    .populate('specializationId', 'name icon');

  res.json({ success: true, message: 'Doctor updated', data: populated });
});

// DELETE /api/doctors/:id  (admin) - removes the profile, the account and free slots
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  await Schedule.deleteMany({ doctorId: doctor._id, isBooked: false });
  await User.findByIdAndDelete(doctor.userId);
  await doctor.deleteOne();

  res.json({ success: true, message: 'Doctor deleted' });
});

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
