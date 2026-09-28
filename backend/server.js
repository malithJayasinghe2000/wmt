require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Uploaded files are served as static URLs, e.g. /uploads/1712345678-photo.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check - used to confirm the hosted API is awake before a demo
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Clinic Appointment System API is running' });
});

// Routes (one file per module owner)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/specializations', require('./routes/specializationRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Error middleware must be last
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
