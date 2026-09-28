const express = require('express');
const router = express.Router();
const {
  createAppointment, getMyAppointments, getAppointmentById,
  cancelAppointment, getAllAppointments, updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// /my must be declared before /:id, otherwise "my" is read as an id
router.get('/my', protect, authorize('patient'), getMyAppointments);

router.route('/')
  .get(protect, authorize('doctor', 'admin'), getAllAppointments)
  .post(protect, authorize('patient'), createAppointment);

router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, authorize('patient'), cancelAppointment);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);

module.exports = router;
