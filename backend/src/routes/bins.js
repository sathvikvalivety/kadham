const express = require("express");
const { body } = require("express-validator");

const { listBins, createBin } = require("../controllers/binController");
const validate = require("../middleware/validate");
const { authorizeRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", listBins);

router.post(
  "/",
  [body("location").isString().notEmpty(), body("qrCode").isString().notEmpty()],
  validate,
  authorizeRole("admin"),
  createBin
);

module.exports = router;
