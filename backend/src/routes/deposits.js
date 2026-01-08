const express = require("express");
const { body } = require("express-validator");

const { createDeposit, listMyDeposits } = require("../controllers/depositController");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  [body("binId").isInt(), body("description").optional().isString()],
  validate,
  createDeposit
);

router.get("/me", listMyDeposits);

module.exports = router;
