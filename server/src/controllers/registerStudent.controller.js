const Student = require("../models/student.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const allowedDomain = "@iiitbh.ac.in";
    if (!email.toLowerCase().endsWith(allowedDomain)) {
      return res.status(400).json({
        success: false,
        message: `Only college email (${allowedDomain}) is allowed`,
      });
    }

    const exists = await Student.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();

    const student = await Student.create({
      name: name,
      email: email.toLowerCase(),
      password: hashedPassword,
      otp,
      isVerified: false,
    });

    

    return res.status(201).json({
      success: true,
      message: "Account created. Please log in."
    });

  } catch (err) {
    console.error("Register Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
