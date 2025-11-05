const Guard = require("../models/guard.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerGuard = async (req, res) => {
  const { name, employeeId, password } = req.body;
  const existing = await Guard.findOne({ employeeId });
  if (existing)
    return res.status(400).json({ message: "Guard already exists" });

  const hash = await bcrypt.hash(password, 10);
  const guard = await Guard.create({ name, employeeId, passwordHash: hash });

  res.status(201).json({ message: "Guard registered", guard });
};

exports.loginGuard = async (req, res) => {
  const { employeeId, password } = req.body;
  const guard = await Guard.findOne({ employeeId });
  if (!guard) return res.status(404).json({ message: "Guard not found" });

  const isMatch = await bcrypt.compare(password, guard.passwordHash);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: guard._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token, guard });
};
