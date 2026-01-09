const express = require("express");
const { body } = require("express-validator");

const { verifyDeposit } = require("../controllers/aiController");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/verify", [body("depositId").isInt()], validate, verifyDeposit);

module.exports = router;
