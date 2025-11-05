const express = require("express");
const router = express.Router();
const { authGuard } = require("../middlewares/auth.middleware");
const { scanQR } = require("../controllers/scan.controller");


module.exports = router;
