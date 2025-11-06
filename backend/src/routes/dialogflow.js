const express = require('express');
const router = express.Router();
const { detectIntent, webhook } = require('../controllers/dialogflowController');
const { protect } = require('../middleware/auth');

router.post('/detect-intent', protect, detectIntent);
router.post('/webhook', webhook);

module.exports = router;