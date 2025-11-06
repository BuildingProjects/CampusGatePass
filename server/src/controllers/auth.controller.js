const Student = require("../models/student.model");
const Guard = require("../models/guard.model");
const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    console.log("[LOGIN] Request received at /api/auth/login");

    const { role, email, password } = req.body;
    console.log("Received Body:", { role, email, password });

    // 400 - missing fields
    if (!role || !email || !password) {
      console.warn("Missing data in request body");
      return res.status(400).json({
        success: false,
        message: "Role, email and password are required",
      });
    }

    const emailLower = email.toLowerCase();
    let user;

    console.log(`Searching for user with role: ${role}, email: ${emailLower}`);

    // find user based on role
    if (role === "student") user = await Student.findOne({ email: emailLower });
    else if (role === "guard")
      user = await Guard.findOne({ email: emailLower });
    else if (role === "admin")
      user = await Admin.findOne({ email: emailLower });
    else {
      console.error("Invalid role provided:", role);
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    // 404 - not found
    if (!user) {
      console.warn(`No ${role} account found for email: ${emailLower}`);
      return res.status(404).json({
        success: false,
        message: `${role} account not found`,
      });
    }

    console.log("User found:", user.email);

    // compare password
    console.log("Comparing entered password with stored hash...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch);

    if (!isMatch) {
      console.warn("Incorrect password for:", user.email);
      return res.status(401).json({
        success: false,
        message: "Wrong password",
      });
    }

    console.log("Password verified successfully");

    // Create JWT token
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET);
    console.log("Token generated successfully");

    // response for all roles
    const responseData = {
      token,
      role,
      email: user.email,
    };

    if (role === "student") {
      responseData.isVerified = user.isVerified;
      console.log("Student verification flag:", user.isVerified);
    }

    console.log("Login success response sending...");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: responseData,
    });
  } catch (err) {
    console.error("[LOGIN ERROR]:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
    });
  }
};
