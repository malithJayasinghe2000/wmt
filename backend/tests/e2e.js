// Temporary end-to-end test of the whole booking flow against a real MongoDB.
process.env.JWT_SECRET = 'e2e_secret';
process.env.JWT_EXPIRE = '1d';

const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { notFound, errorHandler } = require('../middleware/errorMiddleware');
const User = require('../models/User');
const Schedule = require('../models/Schedule');

let pass = 0, fail = 0;
const check = (label, condition, extra = '') => {
  if (condition) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label} ${extra}`); }
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', require('../routes/authRoutes'));
  app.use('/api/doctors', require('../routes/doctorRoutes'));
  app.use('/api/specializations', require('../routes/specializationRoutes'));
  app.use('/api/schedules', require('../routes/scheduleRoutes'));
  app.use('/api/appointments', require('../routes/appointmentRoutes'));
  app.use('/api/prescriptions', require('../routes/prescriptionRoutes'));
  app.use('/api/notifications', require('../routes/notificationRoutes'));
  app.use('/api/users', require('../routes/userRoutes'));
  app.use('/api/dashboard', require('../routes/dashboardRoutes'));
  app.use(notFound);
  app.use(errorHandler);
  return app;
};

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

(async () => {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  const server = buildApp().listen(5098);
  const base = 'http://localhost:5098/api';

  const api = async (method, path, body, token) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  };

  console.log('\n=== AUTHENTICATION ===');
  let r = await api('POST', '/auth/register', { name: 'Nimal', email: 'nimal@test.com', password: 'patient123' });
  check('patient can register', r.status === 201);
  const patientToken = r.body.data?.token;

  r = await api('POST', '/auth/register', { name: 'Nimal', email: 'nimal@test.com', password: 'patient123' });
  check('duplicate email refused', r.status === 400, r.body.message);

  r = await api('POST', '/auth/login', { email: 'nimal@test.com', password: 'wrongpass' });
  check('wrong password refused', r.status === 401);

  // password must actually be hashed in the database
  const stored = await User.findOne({ email: 'nimal@test.com' });
  check('password is hashed, not plain text', stored.password !== 'patient123' && stored.password.startsWith('$2'));

  await User.create({ name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' });
  r = await api('POST', '/auth/login', { email: 'admin@test.com', password: 'admin123' });
  check('admin can log in', r.status === 200);
  const adminToken = r.body.data?.token;

  console.log('\n=== ROLE PROTECTION ===');
  r = await api('POST', '/specializations', { name: 'Cardiology' }, patientToken);
  check('patient cannot create specialization (403)', r.status === 403, r.body.message);

  r = await api('GET', '/dashboard/stats', null, patientToken);
  check('patient cannot open admin dashboard (403)', r.status === 403);

  console.log('\n=== MEMBER 2: SPECIALIZATIONS ===');
  r = await api('POST', '/specializations', { name: 'General Medicine' }, adminToken);
  check('admin creates specialization', r.status === 201);
  const specId = r.body.data?._id;

  console.log('\n=== MEMBER 1: DOCTORS ===');
  r = await api('POST', '/doctors', {
    name: 'Dr. Kamal', email: 'kamal@test.com', password: 'doctor123',
    specializationId: specId, consultationFee: 2500, experienceYears: 8,
  }, adminToken);
  check('admin creates doctor', r.status === 201, r.body.message);
  const doctorId = r.body.data?._id;

  r = await api('POST', '/auth/login', { email: 'kamal@test.com', password: 'doctor123' });
  check('doctor can log in with the created account', r.status === 200);
  const doctorToken = r.body.data?.token;

  r = await api('GET', '/doctors', null, patientToken);
  check('patient can list doctors', r.status === 200 && r.body.count === 1);

  console.log('\n=== MEMBER 2: TIME SLOTS ===');
  r = await api('POST', '/schedules', { date: tomorrow(), startTime: '09:00', endTime: '09:30' }, doctorToken);
  check('doctor creates a slot', r.status === 201, r.body.message);
  const slotId = r.body.data?._id;

  r = await api('POST', '/schedules', { date: tomorrow(), startTime: '09:15', endTime: '09:45' }, doctorToken);
  check('overlapping slot refused', r.status === 400, r.body.message);

  r = await api('POST', '/schedules', { date: '2020-01-01', startTime: '09:00', endTime: '09:30' }, doctorToken);
  check('past-date slot refused', r.status === 400);

  r = await api('POST', '/schedules', { date: tomorrow(), startTime: '11:00', endTime: '10:00' }, doctorToken);
  check('end time before start time refused', r.status === 400);

  r = await api('POST', '/schedules', { date: tomorrow(), startTime: '10:00', endTime: '10:30' }, doctorToken);
  const slot2Id = r.body.data?._id;
  check('non-overlapping second slot accepted', r.status === 201);

  console.log('\n=== MEMBER 3: BOOKING ===');
  r = await api('GET', `/schedules?doctorId=${doctorId}&free=true`, null, patientToken);
  check('patient sees 2 free slots', r.status === 200 && r.body.count === 2);

  r = await api('POST', '/appointments', { scheduleId: slotId, reason: 'Fever for 3 days' }, patientToken);
  check('patient books an appointment', r.status === 201, r.body.message);
  const appointmentId = r.body.data?._id;
  check('new appointment starts as Pending', r.body.data?.status === 'Pending');

  const lockedSlot = await Schedule.findById(slotId);
  check('booked slot is locked (isBooked=true)', lockedSlot.isBooked === true);

  r = await api('POST', '/appointments', { scheduleId: slotId, reason: 'Another patient' }, patientToken);
  check('double booking the same slot refused', r.status === 400, r.body.message);

  r = await api('POST', '/appointments', { scheduleId: slotId }, patientToken);
  check('booking without a reason refused', r.status === 400);

  r = await api('GET', '/appointments/my', null, patientToken);
  check('patient sees their own appointment', r.status === 200 && r.body.count === 1);

  console.log('\n=== MEMBER 4: APPROVAL ===');
  r = await api('PUT', `/appointments/${appointmentId}/status`, { status: 'Completed' }, doctorToken);
  check('cannot complete before confirming', r.status === 400, r.body.message);

  r = await api('PUT', `/appointments/${appointmentId}/status`, { status: 'Confirmed' }, patientToken);
  check('patient cannot change status (403)', r.status === 403);

  r = await api('PUT', `/appointments/${appointmentId}/status`, { status: 'Confirmed' }, doctorToken);
  check('doctor confirms the appointment', r.status === 200, r.body.message);

  r = await api('PUT', `/appointments/${appointmentId}/status`, { status: 'Completed' }, doctorToken);
  check('doctor marks it completed', r.status === 200);

  console.log('\n=== MEMBER 5: PRESCRIPTIONS AND NOTIFICATIONS ===');
  r = await api('POST', '/prescriptions', {
    appointmentId, diagnosis: 'Viral fever', medicines: ['Paracetamol 500mg'], notes: 'Rest 3 days',
  }, doctorToken);
  check('doctor writes a prescription', r.status === 201, r.body.message);

  r = await api('POST', '/prescriptions', { appointmentId, diagnosis: 'Duplicate' }, doctorToken);
  check('second prescription for same visit refused', r.status === 400);

  r = await api('POST', '/prescriptions', { appointmentId, diagnosis: 'By patient' }, patientToken);
  check('patient cannot write a prescription (403)', r.status === 403);

  r = await api('GET', '/prescriptions/my', null, patientToken);
  check('patient reads their prescription', r.status === 200 && r.body.count === 1);

  r = await api('GET', '/notifications', null, patientToken);
  check('patient received notifications', r.status === 200 && r.body.count >= 2, `count=${r.body.count}`);
  const notificationId = r.body.data?.[0]?._id;

  r = await api('PUT', `/notifications/${notificationId}/read`, null, patientToken);
  check('notification marked as read', r.status === 200 && r.body.data?.isRead === true);

  console.log('\n=== CANCELLING FREES THE SLOT ===');
  r = await api('POST', '/appointments', { scheduleId: slot2Id, reason: 'Checkup' }, patientToken);
  const secondAppointment = r.body.data?._id;
  r = await api('PUT', `/appointments/${secondAppointment}/cancel`, null, patientToken);
  check('patient cancels their appointment', r.status === 200);
  const freedSlot = await Schedule.findById(slot2Id);
  check('cancelled slot is free again (isBooked=false)', freedSlot.isBooked === false);

  console.log('\n=== MEMBER 4: USERS AND DASHBOARD ===');
  r = await api('DELETE', `/specializations/${specId}`, null, adminToken);
  check('specialization in use cannot be deleted', r.status === 400, r.body.message);

  r = await api('GET', '/dashboard/stats', null, adminToken);
  check('admin dashboard returns counts', r.status === 200 && r.body.data?.doctors === 1 && r.body.data?.totalAppointments === 2);

  const patientUser = await User.findOne({ email: 'nimal@test.com' });
  r = await api('PUT', `/users/${patientUser._id}/block`, null, adminToken);
  check('admin blocks the patient', r.status === 200);

  r = await api('POST', '/auth/login', { email: 'nimal@test.com', password: 'patient123' });
  check('blocked user cannot log in (403)', r.status === 403, r.body.message);

  r = await api('GET', '/appointments/my', null, patientToken);
  check('blocked user token is rejected (403)', r.status === 403);

  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);

  server.close();
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(fail === 0 ? 0 : 1);
})();
