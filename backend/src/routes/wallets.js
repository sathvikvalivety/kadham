const express = require("express");
const { body } = require("express-validator");

const {
  requestWalletLink,
  verifyWalletSignature,
  listWallets
} = require("../controllers/walletController");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/request-link", [body("address").isString().notEmpty()], validate, requestWalletLink);

router.post(
  "/verify",
  [body("address").isString().notEmpty(), body("signature").isString().notEmpty()],
  validate,
  verifyWalletSignature
);

router.get("/", listWallets);

module.exports = router;
