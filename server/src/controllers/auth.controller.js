const Student = require("../models/student.model");
const Guard = require("../models/guard.model");
const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { role, email, password } = req.body;

    // 400 - missing fields
    if (!role || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Role, email and password are required",
      });
    }

    const emailLower = email.toLowerCase();
    let user;

    // find user based on role
    if (role === "student") user = await Student.findOne({ email: emailLower });
    else if (role === "guard") user = await Guard.findOne({ email: emailLower });
    else if (role === "admin") user = await Admin.findOne({ email: emailLower });
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    // 404 - not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${role} account not found`,
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Wrong password",
      });
    }

    // ✅ Create token (no expiry)
    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET
    );

    // ✅ response for all roles
    const responseData = {
      token,
      role,
      email: user.email,
    };

    // ✅ Only student has verification flag
    if (role === "student") {
      responseData.isVerified = user.isVerified;
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: responseData,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
    });
  }
};
