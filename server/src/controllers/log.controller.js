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




exports.getTodayLogStats = async (req, res) => {
  try {
    // Get today's date range (00:00:00 → 23:59:59)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    console.log("Fetching log stats between:", startOfDay, "and", endOfDay);

    // Count total logs
    const totalLogs = await Log.countDocuments({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    // Count total ENTRY logs
    const totalEntry = await Log.countDocuments({
      action: "ENTRY",
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    // Count total EXIT logs
    const totalExit = await Log.countDocuments({
      action: "EXIT",
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });

    console.log(`Today's Logs: ${totalLogs} | Entry: ${totalEntry} | Exit: ${totalExit}`);

    return res.status(200).json({
      success: true,
      date: startOfDay.toISOString().split("T")[0],
      data: {
        totalLogs,
        totalEntry,
        totalExit,
      },
    });

  } catch (err) {
    console.error("getTodayLogStats Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch today's log statistics",
    });
  }
};
