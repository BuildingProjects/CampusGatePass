const express = require("express");
const router = express.Router();
const { authenticate, isGuard } = require("../middlewares/auth.middleware");
const { createLog } = require("../controllers/log.controller");

router.post("/createlog", authenticate, isGuard, createLog);


module.exports = router;
