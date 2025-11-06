const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Add this new route
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'employee' })
      .select('_id name email department position')
      .sort({ name: 1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;