const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: String, 
  otp: String,
  isVerified: { type: Boolean, default: false },

  // Profile fields
  name: String,
  rollNumber: { type: String, unique: true, sparse: true },
  department: String,
  batch: Number,
  profilePhoto: String, // URL of uploaded photo
  qrCode: String, // QR string

}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
