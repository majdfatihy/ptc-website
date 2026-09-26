const express = require('express');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Request withdrawal
router.post('/', protect, async (req, res) => {
  try {
    const { amount, method, accountDetails } = req.body;
    const user = await User.findById(req.user.id);

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const withdrawal = new Withdrawal({
      user: req.user.id,
      amount,
      method,
      accountDetails,
    });

    await withdrawal.save();

    // Deduct from balance
    user.balance -= amount;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted',
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get withdrawal history
router.get('/', protect, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;