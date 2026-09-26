const express = require('express');
const Earning = require('../models/Earning');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get user earnings
router.get('/', protect, async (req, res) => {
  try {
    const earnings = await Earning.find({ user: req.user.id })
      .populate('task', 'title reward')
      .sort({ createdAt: -1 });

    const summary = {
      totalEarned: earnings.reduce((sum, e) => e.status === 'approved' ? sum + e.amount : sum, 0),
      pending: earnings.reduce((sum, e) => e.status === 'pending' ? sum + e.amount : sum, 0),
      count: earnings.length,
    };

    res.status(200).json({
      success: true,
      summary,
      earnings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;