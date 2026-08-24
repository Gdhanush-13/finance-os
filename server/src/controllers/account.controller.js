const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

exports.list = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ user: req.user._id }).sort({
    isArchived: 1,
    createdAt: 1,
  });
  res.json({ success: true, data: accounts });
});

exports.create = asyncHandler(async (req, res) => {
  const account = await Account.create({
    ...req.body,
    currency: req.body.currency || req.user.currency || "USD",
    user: req.user._id,
    currentBalance: req.body.openingBalance ?? 0,
  });
  res.status(201).json({ success: true, data: account });
});

exports.get = asyncHandler(async (req, res) => {
  const account = await Account.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!account) throw ApiError.notFound("Account not found");
  res.json({ success: true, data: account });
});

exports.update = asyncHandler(async (req, res) => {
  const account = await Account.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!account) throw ApiError.notFound("Account not found");
  res.json({ success: true, data: account });
});

exports.remove = asyncHandler(async (req, res) => {
  const txCount = await Transaction.countDocuments({
    user: req.user._id,
    $or: [{ account: req.params.id }, { toAccount: req.params.id }],
  });
  if (txCount > 0) {
    throw ApiError.badRequest(
      "Account has transactions. Archive it instead of deleting."
    );
  }
  const result = await Account.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!result) throw ApiError.notFound("Account not found");
  res.json({ success: true, data: { message: "Account deleted" } });
});
