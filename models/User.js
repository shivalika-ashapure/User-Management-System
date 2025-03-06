const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  profileImage: { type: String },
  password: { type: String, required: true },
  tempPassword: { type: String },
  
});

module.exports = mongoose.model("User", UserSchema);
