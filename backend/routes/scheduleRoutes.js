const express = require('express');
const router = express.Router();
const {
  getSchedules, createSchedule, updateSchedule, deleteSchedule,
} = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getSchedules)
  .post(protect, authorize('doctor', 'admin'), createSchedule);

router.route('/:id')
  .put(protect, authorize('doctor', 'admin'), updateSchedule)
  .delete(protect, authorize('doctor', 'admin'), deleteSchedule);

module.exports = router;
