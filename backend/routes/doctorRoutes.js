const express = require('express');
const router = express.Router();
const {
  getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getDoctors)
  .post(protect, authorize('admin'), createDoctor);

router.route('/:id')
  .get(protect, getDoctorById)
  .put(protect, authorize('admin'), updateDoctor)
  .delete(protect, authorize('admin'), deleteDoctor);

module.exports = router;
