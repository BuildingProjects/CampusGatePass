const Student = require("../models/student.model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.sendOtp = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student account not found",
      });
    }

    if (student.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    // ✅ Generate 6 digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    student.otp = otp;
    await student.save();

    // ✅ Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Campus Gate Pass" <${process.env.EMAIL_USER}>`,
      to: student.email,
      subject: "Your OTP for CampusGatePass Verification",
      text: `Your OTP is ${otp}. Do not share it with anyone.`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your registered email",
    });

  } catch (err) {
    console.error("Send OTP Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
};



exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student account not found",
      });
    }

    if (!student.otp || student.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    student.isVerified = true;
    student.otp = null;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
};
