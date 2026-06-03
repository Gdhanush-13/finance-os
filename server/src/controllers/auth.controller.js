const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken, generateRefreshToken, verifyRefreshToken } = require("../utils/generateToken");
const User = require("../models/User");
const { seedDefaultsForUser } = require("../services/seed.service");
const env = require("../config/env");

const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "strict" : "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "strict" : "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function setTokenCookies(res, userId) {
  const token = generateToken(userId);
  const refreshToken = generateRefreshToken(userId);
  res.cookie("token", token, ACCESS_COOKIE_OPTS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTS);
  return token;
}

function userResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    timezone: user.timezone,
    avatarUrl: user.avatarUrl,
  };
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("Email already registered");

  const hashed = await User.hashPassword(password);
  const user = await User.create({ name, email, password: hashed });
  await seedDefaultsForUser(user._id);

  const token = setTokenCookies(res, user._id);
  res.status(201).json({ success: true, data: { user: userResponse(user), token } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");

  const token = setTokenCookies(res, user._id);
  res.json({ success: true, data: { user: userResponse(user), token } });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: userResponse(req.user) } });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: { user: userResponse(updated) } });
});

exports.refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw ApiError.unauthorized("No refresh token");
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }
  const user = await User.findById(payload.sub).select("_id name email currency timezone avatarUrl");
  if (!user) throw ApiError.unauthorized("User no longer exists");
  const token = setTokenCookies(res, user._id);
  res.json({ success: true, data: { token } });
});

exports.logout = asyncHandler(async (_req, res) => {
  const cookieBase = { httpOnly: true, secure: env.isProd, sameSite: env.isProd ? "strict" : "lax" };
  res.clearCookie("token", cookieBase);
  res.clearCookie("refreshToken", { ...cookieBase, path: "/api/auth" });
  res.json({ success: true, data: { message: "Logged out" } });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.badRequest("Current password is incorrect");
  user.password = await User.hashPassword(newPassword);
  await user.save();
  res.json({ success: true, data: { message: "Password updated" } });
});
