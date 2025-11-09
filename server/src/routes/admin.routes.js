const express = require("express");
const { registerEmployee, getEmployees } = require("../controllers/employee.controller");
const { authenticate, isAdmin } = require("../middlewares/auth.middleware");
const router = express.Router();
// Register a new guard

router.post("/registeremployee",authenticate, isAdmin, registerEmployee);
router.get("/getemployees", authenticate, isAdmin, getEmployees);

module.exports = router;
