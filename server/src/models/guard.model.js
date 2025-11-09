const mongoose = require("mongoose");

const guardSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: String,
  employeeId: { type: String, unique: true },
  password: String,
});

module.exports = mongoose.model("Guard", guardSchema);
