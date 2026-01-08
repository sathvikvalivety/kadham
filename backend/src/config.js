const dotenv = require("dotenv");
dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "kadham",
    password: process.env.DB_PASSWORD || "kadham",
    database: process.env.DB_NAME || "kadham"
  },
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "",
    rewardManagerAddress: process.env.REWARD_MANAGER_ADDRESS || "",
    oraclePrivateKey: process.env.ORACLE_PRIVATE_KEY || ""
  },
  security: {
    rateLimitWindowMs: 15 * 60 * 1000,
    rateLimitMaxRequests: 100
  }
};

module.exports = config;
