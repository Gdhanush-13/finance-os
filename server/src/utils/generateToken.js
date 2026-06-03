const jwt = require("jsonwebtoken");
const env = require("../config/env");

function generateToken(userId) {
  return jwt.sign({ sub: String(userId), type: "access" }, env.JWT_SECRET, {
    expiresIn: env.accessTokenExpiresIn,
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ sub: String(userId), type: "refresh" }, env.refreshTokenSecret, {
    expiresIn: env.refreshTokenExpiresIn,
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.refreshTokenSecret);
}

module.exports = { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken };
