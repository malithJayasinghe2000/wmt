const express = require('express');
const router = express.Router();
const {
  getSpecializations, createSpecialization, updateSpecialization, deleteSpecialization,
} = require('../controllers/specializationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getSpecializations)
  .post(protect, authorize('admin'), createSpecialization);

router.route('/:id')
  .put(protect, authorize('admin'), updateSpecialization)
  .delete(protect, authorize('admin'), deleteSpecialization);

module.exports = router;
