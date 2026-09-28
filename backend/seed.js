// Creates demo data so the app is never empty during the viva.
// Run once:  npm run seed
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Specialization = require('./models/Specialization');
const Doctor = require('./models/Doctor');
const Schedule = require('./models/Schedule');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const Notification = require('./models/Notification');

const dayOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany(), Specialization.deleteMany(), Doctor.deleteMany(),
    Schedule.deleteMany(), Appointment.deleteMany(), Prescription.deleteMany(),
    Notification.deleteMany(),
  ]);

  await User.create({
    name: 'Clinic Admin', email: 'admin@clinic.com', password: 'admin123',
    role: 'admin', phone: '0770000000',
  });

  await User.create({
    name: 'Nimal Perera', email: 'patient@clinic.com', password: 'patient123',
    role: 'patient', phone: '0771111111',
  });

  const specs = await Specialization.insertMany([
    { name: 'General Medicine', description: 'Fever, cough and common illness' },
    { name: 'Cardiology', description: 'Heart and blood pressure' },
    { name: 'Dermatology', description: 'Skin, hair and nails' },
  ]);

  const doctorUser = await User.create({
    name: 'Dr. Kamal Silva', email: 'doctor@clinic.com', password: 'doctor123',
    role: 'doctor', phone: '0772222222',
  });

  const doctor = await Doctor.create({
    userId: doctorUser._id,
    specializationId: specs[0]._id,
    qualifications: 'MBBS, MD',
    experienceYears: 8,
    consultationFee: 2500,
    about: 'Available on weekday mornings.',
  });

  await Schedule.insertMany([
    { doctorId: doctor._id, date: dayOffset(1), startTime: '09:00', endTime: '09:30' },
    { doctorId: doctor._id, date: dayOffset(1), startTime: '09:30', endTime: '10:00' },
    { doctorId: doctor._id, date: dayOffset(2), startTime: '10:00', endTime: '10:30' },
  ]);

  console.log('Seed complete.');
  console.log('  admin@clinic.com   / admin123');
  console.log('  doctor@clinic.com  / doctor123');
  console.log('  patient@clinic.com / patient123');
  process.exit(0);
};

run().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
