const express = require("express");
const router = express.Router();
const { registerGuard } = require("../controllers/registerGuard.controller");

// Register a new guard
router.post("/registerGuard", registerGuard);

module.exports = router;
