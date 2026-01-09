const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
// const rateLimit = require("express-rate-limit");

const config = require("./config");
const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallets");
const binRoutes = require("./routes/bins");
const depositRoutes = require("./routes/deposits");
const productRoutes = require("./routes/products");
const rewardRoutes = require("./routes/rewards");
const aiRoutes = require("./routes/ai");
const transactionRoutes = require("./routes/transactions");

const { authenticateJWT } = require("./middleware/auth");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
    credentials: true
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

/*
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests
});

if (process.env.NODE_ENV === "production") {
  app.use(limiter);
}
*/

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/wallets", authenticateJWT, walletRoutes);
app.use("/api/bins", authenticateJWT, binRoutes);
app.use("/api/deposits", authenticateJWT, depositRoutes);
app.use("/api/products", authenticateJWT, productRoutes);
app.use("/api/rewards", authenticateJWT, rewardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/transactions", authenticateJWT, transactionRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

module.exports = app;
