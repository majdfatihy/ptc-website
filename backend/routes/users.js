const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, paymentMethod } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, paymentMethod },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get referral stats
router.get('/referrals', protect, async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user.id });
    res.status(200).json({
      success: true,
      count: referrals.length,
      referrals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;