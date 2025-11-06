const express = require('express');
const router = express.Router();
const {
  getMyShifts,
  getAllShifts,
  getCrewSchedule,
  generateCrewShifts,
  createShift,
  updateShift,
  deleteShift,
  deleteUserShifts,
  getNextShift
} = require('../controllers/shiftController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my-shifts', protect, getMyShifts);
router.get('/next-shift', protect, getNextShift);
router.get('/all', protect, authorize('admin'), getAllShifts);
router.get('/crew-schedule', protect, authorize('admin'), getCrewSchedule);
router.post('/generate-crew-shifts', protect, authorize('admin'), generateCrewShifts);
router.post('/', protect, authorize('admin'), createShift);
router.put('/:id', protect, authorize('admin'), updateShift);
router.delete('/:id', protect, authorize('admin'), deleteShift);
router.delete('/user/bulk', protect, authorize('admin'), deleteUserShifts);

module.exports = router;