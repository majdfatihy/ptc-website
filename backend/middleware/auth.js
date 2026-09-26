const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }
};

const adminOnly = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'This route is for admin only' });
  }
  next();
};

module.exports = { protect, adminOnly };