const Log = require("../models/log.model");

exports.createLog = async (req, res) => {
  try {
    const { rollNumber, name, action } = req.body;

    console.log("Incoming Log Request:", req.body);
    console.log("Scanned By (Guard ID):", req.user.id);

    if (!rollNumber || !name || !action) {
      console.log("Missing fields");
      return res.status(400).json({
        success: false,
        message: "rollNumber, name and action are required",
      });
    }

    const log = await Log.create({
      rollNumber,
      name,
      action,
      scannedBy: req.user.id,
    });

    console.log("Log Saved:", log);

    return res.status(201).json({
      success: true,
      message: `Log recorded: ${action}`,
      data: log,
    });
  } catch (err) {
    console.error("Create Log Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create log",
    });
  }
};

exports.getLogsByRollNumber = async (req, res) => {
  try {
    const { rollNumber } = req.query;

    console.log("Fetch Logs Request for Roll No:", rollNumber);

    if (!rollNumber) {
      return res.status(400).json({
        success: false,
        message: "rollNumber is required",
      });
    }
    const rollNumberUpper = rollNumber.toUpperCase();
    const logs = await Log.find({ rollNumber: rollNumberUpper })
      .sort({ timestamp: -1 }) // newest first
      .populate("scannedBy", "name email") // optional: fetch guard info
      .lean(); // return plain JSON

    console.log(`Found ${logs.length} logs for ${rollNumber}`);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    console.error("Fetch Logs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
    });
  }
};

exports.getAllLogs = async (req, res) => {
  try {
    console.log("Fetch All Logs Request");
    const logs = await Log.find({})
      .sort({ timestamp: -1 }) // latest first
      .populate("scannedBy", "name email employeeId") // optional: show guard info
      .lean();
    console.log(`Total logs found: ${logs.length}`);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    console.error("Get All Logs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
    });
  }
};
