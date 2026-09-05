const User = require('../models/User');

// GET /api/users  (admin only) — used to populate "reassign to" dropdowns
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};
