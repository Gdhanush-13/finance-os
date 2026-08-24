const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const Goal = require("../models/Goal");

exports.list = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({
    isAchieved: 1,
    createdAt: -1,
  });
  res.json({ success: true, data: goals });
});

exports.create = asyncHandler(async (req, res) => {
  const goal = await Goal.create({
    ...req.body,
    currency: req.body.currency || req.user.currency || "USD",
    user: req.user._id,
  });
  res.status(201).json({ success: true, data: goal });
});

exports.update = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!goal) throw ApiError.notFound("Goal not found");
  res.json({ success: true, data: goal });
});

exports.contribute = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) throw ApiError.notFound("Goal not found");
  goal.currentAmount = Math.min(
    goal.currentAmount + req.body.amount,
    goal.targetAmount
  );
  if (goal.currentAmount >= goal.targetAmount) goal.isAchieved = true;
  await goal.save();
  res.json({ success: true, data: goal });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await Goal.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!result) throw ApiError.notFound("Goal not found");
  res.json({ success: true, data: { message: "Goal deleted" } });
});
