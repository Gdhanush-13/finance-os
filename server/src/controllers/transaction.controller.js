const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const Transaction = require("../models/Transaction");
const txService = require("../services/transaction.service");

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, type, account, category, from, to, search, sort } =
    req.query;
  const filter = { user: req.user._id, deletedAt: null };
  if (type) filter.type = type;
  if (account) filter.account = account;
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const sortMap = {
    date: { date: 1, createdAt: 1 },
    "-date": { date: -1, createdAt: -1 },
    amount: { amount: 1 },
    "-amount": { amount: -1 },
  };

  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .sort(sortMap[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("account", "name type color icon currency")
      .populate("toAccount", "name type color icon currency")
      .populate("category", "name kind color icon"),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.create = asyncHandler(async (req, res) => {
  const tx = await txService.createTransaction(req.user._id, req.body);
  const populated = await Transaction.findById(tx._id)
    .populate("account", "name type color icon currency")
    .populate("toAccount", "name type color icon currency")
    .populate("category", "name kind color icon");
  res.status(201).json({ success: true, data: populated });
});

exports.get = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id,
    deletedAt: null,
  })
    .populate("account", "name type color icon currency")
    .populate("toAccount", "name type color icon currency")
    .populate("category", "name kind color icon");
  if (!tx) throw ApiError.notFound("Transaction not found");
  res.json({ success: true, data: tx });
});

exports.update = asyncHandler(async (req, res) => {
  const tx = await txService.updateTransaction(
    req.user._id,
    req.params.id,
    req.body
  );
  const populated = await Transaction.findById(tx._id)
    .populate("account", "name type color icon currency")
    .populate("toAccount", "name type color icon currency")
    .populate("category", "name kind color icon");
  res.json({ success: true, data: populated });
});

exports.remove = asyncHandler(async (req, res) => {
  await txService.deleteTransaction(req.user._id, req.params.id);
  res.json({ success: true, data: { message: "Transaction deleted" } });
});

exports.transfer = asyncHandler(async (req, res) => {
  const session = await Transaction.startSession();
  session.startTransaction();
  
  try {
    const { account, toAccount, amount, currency, description, notes, date } = req.body;
    
    // Create debit transaction (money out of source account)
    const debitTx = await Transaction.create([{
      user: req.user._id,
      account,
      toAccount,
      type: "transfer",
      amount,
      currency: currency || "USD",
      description: description || "Transfer",
      notes: notes || "",
      date,
    }], { session });
    
    // Create credit transaction (money into destination account)
    const creditTx = await Transaction.create([{
      user: req.user._id,
      account: toAccount,
      toAccount: account,
      type: "transfer",
      amount,
      currency: currency || "USD",
      description: description || "Transfer",
      notes: notes || "",
      date,
    }], { session });
    
    // Update account balances atomically
    await txService.updateAccountBalance(account, -amount, session);
    await txService.updateAccountBalance(toAccount, amount, session);
    
    await session.commitTransaction();
    
    // Populate and return the debit transaction
    const populated = await Transaction.findById(debitTx[0]._id)
      .populate("account", "name type color icon currency")
      .populate("toAccount", "name type color icon currency")
      .populate("category", "name kind color icon");
    
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});
