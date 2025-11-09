const express = require("express");
const router = express.Router();
const {
  authenticate,
  isGuard,
  isAdmin,
} = require("../middlewares/auth.middleware");
const {
  createLog,
  getLogsByRollNumber,
  getAllLogs,
} = require("../controllers/log.controller");

router.post("/createlog", authenticate, isGuard, createLog);
router.get("/getlog", authenticate, isAdmin, getLogsByRollNumber);
router.get("/getalllogs", authenticate, isAdmin, getAllLogs);

module.exports = router;
