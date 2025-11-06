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

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // ❌ If profile already completed – BLOCK update
    if (student.isProfileCompleted) {
      return res.status(403).json({
        success: false,
        message: "Profile already completed. Editing is not allowed.",
      });
    }

    // ✅ Check if roll number is already assigned to someone else
    const existing = await Student.findOne({ rollNumber });
    if (existing && existing._id.toString() !== req.user.id) {
      return res.status(409).json({
        success: false,
        message: "Roll number already registered by another student",
      });
    }

    // ✅ Update student profile
    student.name = name;
    student.rollNumber = rollNumber;
    student.department = department;
    student.batch = batch;
    student.profilePhoto = profilePhoto;
    student.isProfileCompleted = true;

    // ✅ Create QR Code payload
    const qrPayload = {
      id: student._id.toString(),
      rollNumber: student.rollNumber,
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));
    student.qrCode = qrDataUrl;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Profile completed & QR generated successfully",
      data: student,
    });

  } catch (err) {
    console.error("Complete Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to complete profile",
    });
  }
};
