const express = require("express");
const { registerEmployee } = require("../controllers/registerEmployee.controller");
const router = express.Router();
// Register a new guard

router.post("/registeremployee", registerEmployee);

module.exports = router;
