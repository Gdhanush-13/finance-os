const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const RecurringTransaction = require("../models/RecurringTransaction");
const recurringService = require("../services/recurring.service");

exports.list = asyncHandler(async (req, res) => {
  const items = await RecurringTransaction.find({ user: req.user._id })
    .populate("account", "name color icon")
    .populate("toAccount", "name color icon")
    .populate("category", "name kind color icon")
    .sort({ isActive: -1, nextRunDate: 1 });
  res.json({ success: true, data: items });
});

exports.create = asyncHandler(async (req, res) => {
  const item = await RecurringTransaction.create({
    ...req.body,
    user: req.user._id,
    nextRunDate: req.body.startDate,
  });
  res.status(201).json({ success: true, data: item });
});

exports.update = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (req.body.startDate) update.nextRunDate = req.body.startDate;
  const item = await RecurringTransaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    update,
    { new: true, runValidators: true }
  );
  if (!item) throw ApiError.notFound("Recurring rule not found");
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
