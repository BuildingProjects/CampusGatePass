const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  action: { type: String, enum: ["ENTRY", "EXIT"] },
  timestamp: { type: Date, default: Date.now },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Guard" },
});

module.exports = mongoose.model("Log", logSchema);
