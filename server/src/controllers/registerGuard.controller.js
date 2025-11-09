const Guard = require("../models/guard.model");
const bcrypt = require("bcrypt");

// =============================
//  Register a New Guard
// =============================
exports.registerGuard = async (req, res) => {
  try {
    const { name, email, employeeId, password } = req.body;

    // Basic validation
    if (!name || !email || !employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, employeeId, password) are required",
      });
    }

    // Check if email already registered
    const existingGuard = await Guard.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId }],
    });

    if (existingGuard) {
      return res.status(409).json({
        success: false,
        message: "Guard with this email or employee ID already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create guard
    const guard = await Guard.create({
      name,
      email: email.toLowerCase(),
      employeeId,
      password: passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: "Guard registered successfully",
      data: {
        id: guard._id,
        name: guard.name,
        email: guard.email,
        employeeId: guard.employeeId,
      },
    });
  } catch (err) {
    console.error("Register Guard Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering guard",
    });
  }
};
