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

    console.log("✅ Log Saved:", log);

    return res.status(201).json({
      success: true,
      message: `Log recorded: ${action}`,
      data: log,
    });

  } catch (err) {
    console.error("🔥 Create Log Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create log",
    });
  }
};
