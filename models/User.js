const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  dob: String,
  mobile: String
});

module.exports = mongoose.model('User', UserSchema);
