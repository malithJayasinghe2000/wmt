const express = require('express');
const router = express.Router();
const {
  createPrescription, getMyPrescriptions, getPrescriptionById,
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my', protect, getMyPrescriptions);
router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/:id', protect, getPrescriptionById);

module.exports = router;
