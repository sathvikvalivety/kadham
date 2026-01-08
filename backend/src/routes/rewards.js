const express = require("express");
const { body } = require("express-validator");

const { rewardDeposit } = require("../controllers/rewardController");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/deposit",
  [body("depositId").isInt(), body("amountGbc").isFloat({ gt: 0 })],
  validate,
  rewardDeposit
);

module.exports = router;
