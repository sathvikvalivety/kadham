const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config");
const User = require("../models/User");

async function register(req, res) {
  const { email, password } = req.body;

  const existing = await User.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.createUser({ email, passwordHash, role: "user" });

  return res.status(201).json({ id: user.id, email: user.email, role: user.role });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
}

module.exports = { register, login };
