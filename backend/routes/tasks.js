const express = require('express');
const Task = require('../models/Task');
const Earning = require('../models/Earning');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get all active tasks
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'active' }).populate('createdBy', 'name');
    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete a task
router.post('/:taskId/complete', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Create earning record
    const earning = new Earning({
      user: req.user.id,
      task: task._id,
      amount: task.reward,
      type: 'task',
      status: 'approved',
    });

    await earning.save();

    // Update user balance
    const user = await User.findById(req.user.id);
    user.balance += task.reward;
    user.totalEarned += task.reward;
    user.tasksCompleted += 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Task completed successfully',
      earning: earning.amount,
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create task
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, type, reward, duration, link } = req.body;
    const task = new Task({
      title,
      description,
      type,
      reward,
      duration,
      link,
      createdBy: req.user.id,
    });
    await task.save();
    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;