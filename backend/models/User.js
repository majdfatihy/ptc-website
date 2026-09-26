const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  phone: String,
  country: String,
  balance: {
    type: Number,
    default: 0,
  },
  totalEarned: {
    type: Number,
    default: 0,
  },
  referralCode: String,
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  adsViewed: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },
  paymentMethod: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);