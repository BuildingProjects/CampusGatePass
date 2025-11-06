const express = require("express");
const router = express.Router();

const { authenticate, isStudent, isStudentVerified, isProfileCompleted } = require("../middlewares/auth.middleware");
const { getProfile, completeProfile } = require("../controllers/profile.controller");

router.get("/getprofile", authenticate, isStudent, isStudentVerified, isProfileCompleted, getProfile);
router.put("/completeprofile", authenticate, isStudent, isStudentVerified, completeProfile);

module.exports = router;