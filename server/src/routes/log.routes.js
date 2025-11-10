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
  getTodayLogStats,
} = require("../controllers/log.controller");

router.post("/createlog", authenticate, isGuard, createLog);
router.get("/getlog", authenticate, isAdmin, getLogsByRollNumber);
router.get("/getalllogs", authenticate, isAdmin, getAllLogs);
router.get("/gettodaylogstats", authenticate, isAdmin, getTodayLogStats);

module.exports = router;
