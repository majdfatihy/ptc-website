const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Withdrawal = require('../models/Withdrawal');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get dashboard stats
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const totalEarningsDistributed = await User.aggregate([{ $group: { _id: null, total: { $sum: '$totalEarned' } } }]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTasks,
        pendingWithdrawals,
        totalEarningsDistributed: totalEarningsDistributed[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all withdrawals
router.get('/withdrawals', protect, adminOnly, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve withdrawal
router.put('/withdrawals/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', processedAt: new Date() },
      { new: true }
    );
    res.status(200).json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;