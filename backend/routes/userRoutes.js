const express = require('express');
const router = express.Router();
const { getUsers, toggleBlockUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id/block', protect, authorize('admin'), toggleBlockUser);

module.exports = router;
