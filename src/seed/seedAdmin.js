// Creates (or updates) the administrator account.
// Admins must NOT be created through the public /register endpoint —
// this script is the only supported way, per the assignment spec.
//
// Usage: npm run seed:admin

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const name = process.env.ADMIN_NAME || 'Administrator';

  let admin = await User.findOne({ email });
  if (admin) {
    admin.password = password; // will be re-hashed by the pre-save hook
    admin.role = 'admin';
    admin.name = name;
    await admin.save();
    console.log(`Existing admin updated: ${email}`);
  } else {
    admin = await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin created: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
