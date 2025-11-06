const Student = require("../models/student.model");
const QRCode = require("qrcode");


exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password -otp");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });

  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};


//complete profile and qr generation
exports.completeProfile = async (req, res) => {
  try {
    const { name, rollNumber, department, batch, profilePhoto } = req.body;

    if (!name || !rollNumber || !department || !batch) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, rollNumber, department, batch) are required",
      });
    }

    // ensure roll number not used by another student
    const existing = await Student.findOne({ rollNumber });
    if (existing && existing._id.toString() !== req.user.id) {
      return res.status(409).json({
        success: false,
        message: "Roll number already registered by another student",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { name, rollNumber, department, batch, profilePhoto },
      { new: true }
    ).select("-password -otp");

    if(!student){
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const qrPayLoad = {
      id: student._id.toString(),
      rollNumber: student.rollNumber,
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayLoad));

    student.qrCode = qrDataUrl;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated & qr generated successfully",
      data: student,
    });

  } catch (err) {
    console.error("Complete Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

