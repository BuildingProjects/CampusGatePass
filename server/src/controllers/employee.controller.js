const Guard = require("../models/guard.model");
const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");

exports.registerEmployee = async (req, res) => {
  try {
    const { name, email, employeeId, password, role } = req.body;

    // ✅ Basic validation
    if (!name || !email || !employeeId || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (name, email, employeeId, password, role) are required",
      });
    }

    const emailLower = email.toLowerCase();

    // ✅ Check existing user in BOTH collections
    const existingAdmin = await Admin.findOne({
      $or: [{ email: emailLower }, { employeeId }],
    });
    const existingGuard = await Guard.findOne({
      $or: [{ email: emailLower }, { employeeId }],
    });

    if (existingAdmin || existingGuard) {
      return res.status(409).json({
        success: false,
        message: "User with this email or employee ID already exists",
      });
    }

    // ✅ Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const roleLower = role.toLowerCase();
    const employeeIdUpper = employeeId.toUpperCase();

    let createdUser;

    // ✅ Insert in correct collection based on role
    if (roleLower === "guard") {
      createdUser = await Guard.create({
        name,
        email: emailLower,
        employeeId: employeeIdUpper,
        password: passwordHash,
      });
    } else {
      createdUser = await Admin.create({
        name,
        email: emailLower,
        employeeId: employeeIdUpper,
        password: passwordHash,
      });
    }

    return res.status(201).json({
      success: true,
      message: `${role.toUpperCase()} registered successfully`,
      data: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        employeeId: createdUser.employeeId,
        role,
      },
    });
  } catch (err) {
    console.error("Register Employee Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering employee",
    });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required (guard or admin)",
      });
    }

    if (!["guard", "admin"].includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles: guard, admin",
      });
    }

    let employees = [];

    if (role === "guard") {
      employees = await Guard.find({}, "-password").sort({ name: 1 }).lean();
    } else {
      employees = await Admin.find({}, "-password").sort({ name: 1 }).lean();
    }

    return res.status(200).json({
      success: true,
      role,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    console.error("Get Employees Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
};
