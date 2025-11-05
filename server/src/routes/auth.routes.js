const express = require("express");
const router = express.Router();
const { registerStudent } = require("../controllers/registerStudent.controller");
const { login } = require("../controllers/auth.controller");
const { sendOtp, verifyOtp } = require("../controllers/otp.controller");
const { authenticate, isStudent } = require("../middlewares/auth.middleware");

router.post("/registerstudent", registerStudent);
router.post("/login", login);
router.post("/send-otp", authenticate, isStudent, sendOtp);
router.post("/verify-otp", authenticate, isStudent, verifyOtp);

module.exports = router;
