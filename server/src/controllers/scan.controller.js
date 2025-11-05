const Student = require("../models/student.model");
const Log = require("../models/log.model");

exports.scanQR = async (req, res) => {
  const { id } = req.body; // extracted from QR JSON
  const guardId = req.guardId;

  const student = await Student.findById(id);
  if (!student || !student.isActive)
    return res.status(404).json({ message: "Invalid or inactive student" });

  const lastLog = await Log.findOne({ studentId: id }).sort({ timestamp: -1 });
  const action = lastLog && lastLog.action === "ENTRY" ? "EXIT" : "ENTRY";

  const log = await Log.create({
    studentId: id,
    action,
    scannedBy: guardId,
  });

  res.json({ message: `${action} recorded`, log });
};
