const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken } = require("../utils/generateToken");
const User = require("../models/User");
const { seedDefaultsForUser } = require("../services/seed.service");
const env = require("../config/env");

const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

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

  const token = generateToken(user._id);
  res.cookie("token", token, COOKIE_OPTS);
  res.status(201).json({ success: true, data: { user: userResponse(user), token } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");

  const token = generateToken(user._id);
  res.cookie("token", token, COOKIE_OPTS);
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

exports.logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: env.isProd, sameSite: env.isProd ? "strict" : "lax" });
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
