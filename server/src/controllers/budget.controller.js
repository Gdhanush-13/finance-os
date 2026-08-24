const dayjs = require("dayjs");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const { preferredCurrency } = require("../utils/currency");

function periodWindow(period, start) {
  const s = dayjs(start);
  let from = s;
  let to;
  if (period === "monthly") to = s.add(1, "month");
  else if (period === "weekly") to = s.add(1, "week");
  else to = s.add(1, "year");
  return { from: from.toDate(), to: to.toDate() };
}

async function withSpend(budget, userId, fallbackCurrency) {
  const { from, to } = periodWindow(budget.period, budget.startDate);
  const currency = budget.currency || fallbackCurrency;
  const filter = {
    user: userId,
    type: "expense",
    date: { $gte: from, $lt: to },
    deletedAt: null,
  };
  if (budget.category) filter.category = budget.category._id || budget.category;
  const result = await Transaction.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "accounts",
        localField: "account",
        foreignField: "_id",
        as: "sourceAccount",
      },
    },
    { $unwind: { path: "$sourceAccount", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $expr: {
          $eq: [
            { $ifNull: ["$sourceAccount.currency", { $ifNull: ["$currency", currency] }] },
            currency,
          ],
        },
      },
    },
    { $group: { _id: null, spent: { $sum: "$amount" } } },
  ]);
  const spent = result[0]?.spent || 0;
  const remaining = Math.max(budget.amount - spent, 0);
  const progress = budget.amount > 0 ? Math.min(spent / budget.amount, 1.5) : 0;
  return {
    ...budget.toObject(),
    currency,
    spent,
    remaining,
    progress,
    overBudget: spent > budget.amount,
    windowStart: from,
    windowEnd: to,
  };
}

exports.list = asyncHandler(async (req, res) => {
  const fallbackCurrency = await preferredCurrency(req.user);
  const budgets = await Budget.find({ user: req.user._id })
    .populate("category", "name kind color icon")
    .sort({ isArchived: 1, createdAt: -1 });
  const enriched = await Promise.all(
    budgets.map((b) => withSpend(b, req.user._id, fallbackCurrency))
  );
  res.json({ success: true, data: enriched });
});

exports.create = asyncHandler(async (req, res) => {
  const currency = req.body.currency || await preferredCurrency(req.user);
  const budget = await Budget.create({ ...req.body, currency, user: req.user._id });
  const populated = await budget.populate("category", "name kind color icon");
  res.status(201).json({
    success: true,
    data: await withSpend(populated, req.user._id, currency),
  });
});

exports.update = asyncHandler(async (req, res) => {
  const fallbackCurrency = await preferredCurrency(req.user);
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  ).populate("category", "name kind color icon");
  if (!budget) throw ApiError.notFound("Budget not found");
  res.json({
    success: true,
    data: await withSpend(budget, req.user._id, fallbackCurrency),
  });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await Budget.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!result) throw ApiError.notFound("Budget not found");
  res.json({ success: true, data: { message: "Budget deleted" } });
});
