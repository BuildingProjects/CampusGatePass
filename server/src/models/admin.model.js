const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: String,
  employeeId: { type: String, unique: true },
  passwordHash: String,
});

module.exports = mongoose.model("Admin", adminSchema);
