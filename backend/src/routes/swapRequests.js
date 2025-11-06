const express = require('express');
const router = express.Router();
const {
  createSwapRequest,
  getSwapRequests,
  getAvailableShiftsForSwap,
  approveSwapRequest,
  rejectSwapRequest
} = require('../controllers/swapController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createSwapRequest);
router.get('/', protect, getSwapRequests);
router.get('/available/:shiftId', protect, getAvailableShiftsForSwap);
router.put('/:id/approve', protect, authorize('admin'), approveSwapRequest);
router.put('/:id/reject', protect, authorize('admin'), rejectSwapRequest);

module.exports = router;