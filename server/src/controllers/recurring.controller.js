const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const RecurringTransaction = require("../models/RecurringTransaction");
const Account = require("../models/Account");
const recurringService = require("../services/recurring.service");

exports.list = asyncHandler(async (req, res) => {
  const items = await RecurringTransaction.find({ user: req.user._id })
    .populate("account", "name color icon currency")
    .populate("toAccount", "name color icon currency")
    .populate("category", "name kind color icon")
    .sort({ isActive: -1, nextRunDate: 1 });
  const data = items.map((item) => {
    const value = item.toObject();
    value.currency = value.account?.currency || value.currency || req.user.currency || "USD";
    return value;
  });
  res.json({ success: true, data });
});

exports.create = asyncHandler(async (req, res) => {
  const account = await Account.findOne({ _id: req.body.account, user: req.user._id });
  if (!account) throw ApiError.badRequest("Account not found");
  if (req.body.type === "transfer") {
    const toAccount = await Account.findOne({ _id: req.body.toAccount, user: req.user._id });
    if (!toAccount) throw ApiError.badRequest("Destination account not found");
    if (toAccount.currency !== account.currency) {
      throw ApiError.badRequest("Transfers require accounts with the same currency");
    }
  }
  const item = await RecurringTransaction.create({
    ...req.body,
    currency: req.body.currency || account.currency || req.user.currency || "USD",
    user: req.user._id,
    nextRunDate: req.body.startDate,
  });
  await item.populate("account", "name color icon currency");
  res.status(201).json({ success: true, data: item });
});

exports.update = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  const existing = await RecurringTransaction.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!existing) throw ApiError.notFound("Recurring rule not found");
  const account = await Account.findOne({
    _id: req.body.account || existing.account,
    user: req.user._id,
  });
  if (!account) throw ApiError.badRequest("Account not found");
  const nextType = req.body.type || existing.type;
  const nextToAccount = req.body.toAccount !== undefined ? req.body.toAccount : existing.toAccount;
  if (nextType === "transfer") {
    const toAccount = await Account.findOne({ _id: nextToAccount, user: req.user._id });
    if (!toAccount) throw ApiError.badRequest("Destination account not found");
    if (toAccount.currency !== account.currency) {
      throw ApiError.badRequest("Transfers require accounts with the same currency");
    }
  }
  update.currency = account.currency || req.body.currency || req.user.currency || "USD";
  if (req.body.startDate) update.nextRunDate = req.body.startDate;
  const item = await RecurringTransaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    update,
    { new: true, runValidators: true }
  );
  if (!item) throw ApiError.notFound("Recurring rule not found");
  await item.populate("account", "name color icon currency");
  await item.populate("toAccount", "name color icon currency");
  res.json({ success: true, data: item });
});

exports.remove = asyncHandler(async (req, res) => {
  const item = await RecurringTransaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!item) throw ApiError.notFound("Recurring rule not found");
  res.json({ success: true, data: { message: "Recurring rule deleted" } });
});

exports.runNow = asyncHandler(async (req, res) => {
  const result = await recurringService.processDueForUser(req.user._id);
  res.json({ success: true, data: result });
});
