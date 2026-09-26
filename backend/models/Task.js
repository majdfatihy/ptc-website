const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ['ad_view', 'survey', 'click', 'app_test', 'email_signup', 'comment'],
    required: true,
  },
  reward: {
    type: Number,
    required: true,
  },
  duration: String,
  link: String,
  maxCompletions: {
    type: Number,
    default: -1,
  },
  completedCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', taskSchema);