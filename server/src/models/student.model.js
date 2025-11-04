const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  rollNumber: { type: String, unique: true },
  email: { type: String, unique: true },
  department: String,
  year: Number,
  qrCode: String, // base64 QR or encrypted string
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Student", studentSchema);
