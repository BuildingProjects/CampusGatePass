const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },   // simple string now
  name: { type: String, required: true },         // student's name stored
  action: { type: String, enum: ["ENTRY", "EXIT"], required: true },
  timestamp: { type: Date, default: Date.now },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Guard", required: true },
});

module.exports = mongoose.model("Log", logSchema);
