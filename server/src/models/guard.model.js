const mongoose = require("mongoose");

const guardSchema = new mongoose.Schema({
  name: String,
  employeeId: { type: String, unique: true },
  passwordHash: String,
});

module.exports = mongoose.model("Guard", guardSchema);
