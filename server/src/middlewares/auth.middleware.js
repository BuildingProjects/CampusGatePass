const jwt = require("jsonwebtoken");
const Student = require("../models/student.model");

// ✅ Check if user is logged in (token valid)
exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ✅ Check if role is student (does NOT check verification)
exports.isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Students only.",
    });
  }
  next();
};

// ✅ Check if student is verified (use after isStudent)
exports.isStudentVerified = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student account not found",
      });
    }

    if (!student.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified",
        isVerified: false,
      });
    }

    next();

  } catch (err) {
    console.error("isStudentVerified Middleware Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ✅ Guard role check
exports.isGuard = (req, res, next) => {
  if (req.user.role !== "guard") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Guards only.",
    });
  }
  next();
};

// ✅ Admin role check
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
  next();
};
