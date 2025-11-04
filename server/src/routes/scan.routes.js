const express = require("express");
const router = express.Router();
const { authGuard } = require("../middlewares/auth.middleware");
const { scanQR } = require("../controllers/scan.controller");

router.post("/", authGuard, scanQR);

module.exports = router;
