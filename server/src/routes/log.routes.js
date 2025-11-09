const express = require("express");
const router = express.Router();
const { authenticate, isGuard, isAdmin } = require("../middlewares/auth.middleware");
const { createLog, getLogsByRollNumber } = require("../controllers/log.controller");

router.post("/createlog", authenticate, isGuard, createLog);
router.get("/getlog", authenticate, isAdmin, getLogsByRollNumber);


module.exports = router;
