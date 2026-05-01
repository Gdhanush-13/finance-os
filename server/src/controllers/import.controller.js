const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const Account = require("../models/Account");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const txService = require("../services/transaction.service");

const REQUIRED_HEADERS = ["date", "type", "amount"];

exports.importCsv = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("CSV file is required");
  const accountId = req.body.accountId;
  if (!accountId) throw ApiError.badRequest("accountId is required");

  const account = await Account.findOne({
    _id: accountId,
    user: req.user._id,
  });
  if (!account) throw ApiError.badRequest("Invalid account");

  let rows;
  try {
    rows = parse(req.file.buffer.toString("utf-8"), {
      columns: (h) => h.map((c) => c.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    throw ApiError.badRequest(`CSV parse error: ${err.message}`);
  }

  if (rows.length === 0) throw ApiError.badRequest("CSV is empty");
  const headers = Object.keys(rows[0]);
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length) {
    throw ApiError.badRequest(`Missing CSV headers: ${missing.join(", ")}`);
  }

  const categories = await Category.find({ user: req.user._id });
  const categoryByName = new Map(
    categories.map((c) => [c.name.toLowerCase(), c])
  );

  const results = { imported: 0, skipped: 0, errors: [] };
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    try {
      const type = String(row.type).toLowerCase();
      if (!["income", "expense"].includes(type)) {
        throw new Error("type must be income or expense");
      }
      const amount = Number(row.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("amount must be a positive number");
      }
      const date = new Date(row.date);
      if (Number.isNaN(date.getTime())) throw new Error("invalid date");

      let categoryId = null;
      if (row.category) {
        const found = categoryByName.get(String(row.category).toLowerCase());
        if (found && found.kind === type) categoryId = found._id;
      }

      // eslint-disable-next-line no-await-in-loop
      await txService.createTransaction(req.user._id, {
        account: accountId,
        category: categoryId,
        type,
        amount,
        currency: row.currency
          ? String(row.currency).toUpperCase()
          : account.currency,
        description: row.description || "",
        notes: row.notes || "",
        tags: row.tags
          ? String(row.tags)
              .split(/[;,|]/)
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean)
          : [],
        date,
      });
      results.imported += 1;
    } catch (err) {
      results.skipped += 1;
      results.errors.push({ row: i + 2, message: err.message });
    }
  }

  res.json({ success: true, data: results });
});

exports.exportCsv = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
  }
  const items = await Transaction.find(filter)
    .sort({ date: -1 })
    .populate("account", "name")
    .populate("toAccount", "name")
    .populate("category", "name");

  const rows = items.map((t) => ({
    date: t.date.toISOString().slice(0, 10),
    type: t.type,
    amount: t.amount,
    currency: t.currency,
    account: t.account?.name || "",
    toAccount: t.toAccount?.name || "",
    category: t.category?.name || "",
    description: t.description || "",
    notes: t.notes || "",
    tags: (t.tags || []).join(";"),
  }));
  const csv = stringify(rows, { header: true });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="transactions-${Date.now()}.csv"`
  );
  res.send(csv);
});

exports.template = (_req, res) => {
  const csv = stringify(
    [
      {
        date: "2026-05-01",
        type: "expense",
        amount: 12.5,
        currency: "USD",
        category: "Groceries",
        description: "Weekly groceries",
        notes: "",
        tags: "food;weekly",
      },
    ],
    { header: true }
  );
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="finance-os-template.csv"'
  );
  res.send(csv);
};
