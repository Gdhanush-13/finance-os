const dayjs = require("dayjs");
const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

function rangeFromQuery(query) {
  const to = query.to ? dayjs(query.to) : dayjs().endOf("day");
  const from = query.from ? dayjs(query.from) : to.subtract(5, "month").startOf("month");
  return { from: from.toDate(), to: to.toDate() };
}

exports.summary = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const { from, to } = rangeFromQuery(req.query);

  const [byType, accounts, budgetCount, goals] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: from, $lte: to }, deletedAt: null } },
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
        $group: {
          _id: {
            type: "$type",
            currency: {
              $ifNull: ["$sourceAccount.currency", { $ifNull: ["$currency", req.user.currency || "USD"] }],
            },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Account.find({ user: userId, isArchived: false }).select(
      "name currentBalance currency type color icon"
    ),
    Budget.countDocuments({ user: userId, isArchived: false }),
    Goal.find({ user: userId }).select("name targetAmount currentAmount isAchieved"),
  ]);

  const rowsFor = (type) => byType.filter((row) => row._id.type === type);
  const amountBreakdown = (type) =>
    rowsFor(type).map((row) => ({ currency: row._id.currency, amount: row.total }));
  const incomeRows = rowsFor("income");
  const expenseRows = rowsFor("expense");
  const income = incomeRows.reduce((sum, row) => sum + row.total, 0);
  const expense = expenseRows.reduce((sum, row) => sum + row.total, 0);
  const transferCount = rowsFor("transfer").reduce((sum, row) => sum + row.count, 0);
  const totalBalance = accounts.reduce((s, a) => s + a.currentBalance, 0);
  const balanceMap = new Map();
  for (const account of accounts) {
    const currency = account.currency || req.user.currency || "USD";
    balanceMap.set(currency, (balanceMap.get(currency) || 0) + account.currentBalance);
  }
  const balancesByCurrency = Array.from(balanceMap, ([currency, amount]) => ({ currency, amount }));
  const accountCurrencies = [...balanceMap.keys()];
  const currency = accountCurrencies.length === 1
    ? accountCurrencies[0]
    : req.user.currency || accountCurrencies[0] || "USD";

  res.json({
    success: true,
    data: {
      range: { from, to },
      income,
      expense,
      net: income - expense,
      savingsRate: income > 0 ? (income - expense) / income : 0,
      transactionCount:
        incomeRows.reduce((sum, row) => sum + row.count, 0) +
        expenseRows.reduce((sum, row) => sum + row.count, 0) +
        transferCount,
      accountCount: accounts.length,
      totalBalance,
      currency,
      hasMixedCurrencies: accountCurrencies.length > 1,
      balancesByCurrency,
      incomeByCurrency: amountBreakdown("income"),
      expenseByCurrency: amountBreakdown("expense"),
      budgetCount,
      goalCount: goals.length,
      goalsCompleted: goals.filter((g) => g.isAchieved).length,
      accounts,
    },
  });
});

exports.cashflow = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const months = Math.min(Math.max(parseInt(req.query.months || "6", 10), 1), 24);
  const start = dayjs().startOf("month").subtract(months - 1, "month").toDate();

  const data = await Transaction.aggregate([
    { $match: { user: userId, date: { $gte: start }, type: { $in: ["income", "expense"] }, deletedAt: null } },
    {
      $group: {
        _id: {
          y: { $year: "$date" },
          m: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const buckets = {};
  for (let i = 0; i < months; i += 1) {
    const d = dayjs(start).add(i, "month");
    const key = d.format("YYYY-MM");
    buckets[key] = { month: key, label: d.format("MMM YY"), income: 0, expense: 0, net: 0 };
  }
  for (const row of data) {
    const key = `${row._id.y}-${String(row._id.m).padStart(2, "0")}`;
    if (!buckets[key]) continue;
    buckets[key][row._id.type] = row.total;
  }
  const series = Object.values(buckets).map((b) => ({ ...b, net: b.income - b.expense }));
  res.json({ success: true, data: series });
});

exports.categoryBreakdown = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const { from, to } = rangeFromQuery(req.query);
  const type = req.query.type === "income" ? "income" : "expense";

  const data = await Transaction.aggregate([
    { $match: { user: userId, type, date: { $gte: from, $lte: to }, deletedAt: null } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        categoryId: "$_id",
        name: { $ifNull: ["$category.name", "Uncategorized"] },
        color: { $ifNull: ["$category.color", "#94a3b8"] },
        icon: { $ifNull: ["$category.icon", "tag"] },
        total: 1,
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  const total = data.reduce((s, d) => s + d.total, 0);
  const enriched = data.map((d) => ({
    ...d,
    share: total > 0 ? d.total / total : 0,
  }));
  res.json({ success: true, data: enriched, meta: { total, type, from, to } });
});

exports.recent = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
  const items = await Transaction.find({ user: userId, deletedAt: null })
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .populate("account", "name color icon currency")
    .populate("category", "name kind color icon");
  res.json({ success: true, data: items });
});
