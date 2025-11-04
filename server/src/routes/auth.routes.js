const express = require("express");
const router = express.Router();
const { registerGuard, loginGuard } = require("../controllers/auth.controller");

router.post("/register", registerGuard);
router.post("/login", loginGuard);

module.exports = router;
