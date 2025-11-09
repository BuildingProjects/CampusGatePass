const express = require("express");
const { registerEmployee } = require("../controllers/registerEmployee.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");
const router = express.Router();
// Register a new guard

router.post("/registeremployee",authenticate, isAdmin, registerEmployee);

module.exports = router;
