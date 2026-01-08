const express = require("express");

const { listMyTransactions } = require("../controllers/transactionController");

const router = express.Router();

router.get("/me", listMyTransactions);

module.exports = router;
