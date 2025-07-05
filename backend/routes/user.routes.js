const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const User = require('../models/user.model');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('location').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'phone', 'location'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('stats');
    res.json(user.stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router; 