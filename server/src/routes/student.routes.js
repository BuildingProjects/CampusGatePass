const express = require("express");
const router = express.Router();

const { authenticate, isStudent, isStudentVerified } = require("../middlewares/auth.middleware");
const { getProfile, completeProfile } = require("../controllers/profile.controller");

router.get("/getprofile", authenticate, isStudent, isStudentVerified, getProfile);
router.put("/updateprofile", authenticate, isStudent, isStudentVerified, completeProfile);

module.exports = router;