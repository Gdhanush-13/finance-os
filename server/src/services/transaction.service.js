const ApiError = require("../utils/ApiError");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

async function applyBalanceDelta(userId, accountId, delta, session) {
  const account = await Account.findOne({ _id: accountId, user: userId }).session(session);
  if (!account) throw ApiError.badRequest("Account not found");
  account.currentBalance += delta;
  await account.save({ session });
}

async function updateAccountBalance(userId, accountId, delta, session) {
  await applyBalanceDelta(userId, accountId, delta, session);
}

function deltaForType(type, amount) {
  if (type === "income") return amount;
  if (type === "expense") return -amount;
  return 0;
}

async function createTransaction(userId, payload) {
  if (payload.type === "transfer") {
    if (!payload.toAccount || String(payload.toAccount) === String(payload.account)) {
      throw ApiError.badRequest("Transfer requires distinct toAccount");
    }
  }
  
  const account = await Account.findOne({ _id: payload.account, user: userId });
  if (!account) throw ApiError.badRequest("Account not found");
  const currency = account.currency || payload.currency || "USD";
  if (payload.type === "transfer") {
    const toAccount = await Account.findOne({ _id: payload.toAccount, user: userId });
    if (!toAccount) throw ApiError.badRequest("Destination account not found");
    if (toAccount.currency !== currency) {
      throw ApiError.badRequest("Transfers require accounts with the same currency");
    }
  }
  
  const tx = await Transaction.create({ ...payload, currency, user: userId });
  if (tx.type === "transfer") {
    await applyBalanceDelta(userId, tx.account, -tx.amount);
    await applyBalanceDelta(userId, tx.toAccount, tx.amount);
  } else {
    await applyBalanceDelta(userId, tx.account, deltaForType(tx.type, tx.amount));
  }
  return tx;
}

async function reverseTransactionEffects(userId, tx) {
  if (tx.type === "transfer") {
    await applyBalanceDelta(userId, tx.account, tx.amount);
    if (tx.toAccount) await applyBalanceDelta(userId, tx.toAccount, -tx.amount);
  } else {
    await applyBalanceDelta(userId, tx.account, -deltaForType(tx.type, tx.amount));
  }
}

async function deleteTransaction(userId, id) {
  const tx = await Transaction.findOne({ _id: id, user: userId, deletedAt: null });
  if (!tx) throw ApiError.notFound("Transaction not found");
  await reverseTransactionEffects(userId, tx);
  tx.deletedAt = new Date();
  await tx.save();
  return { _id: id };
}

async function updateTransaction(userId, id, payload) {
  const existing = await Transaction.findOne({ _id: id, user: userId, deletedAt: null });
  if (!existing) throw ApiError.notFound("Transaction not found");
  const nextType = payload.type || existing.type;
  const nextAccount = payload.account || existing.account;
  const nextToAccount = payload.toAccount !== undefined ? payload.toAccount : existing.toAccount;
  const account = await Account.findOne({ _id: nextAccount, user: userId });
  if (!account) throw ApiError.badRequest("Account not found");
  const nextCurrency = account.currency || payload.currency || existing.currency || "USD";

  if (nextType === "transfer") {
    if (!nextToAccount || String(nextToAccount) === String(nextAccount)) {
      throw ApiError.badRequest("Transfer requires distinct toAccount");
    }
    const toAccount = await Account.findOne({ _id: nextToAccount, user: userId });
    if (!toAccount) throw ApiError.badRequest("Destination account not found");
    if (toAccount.currency !== nextCurrency) {
      throw ApiError.badRequest("Transfers require accounts with the same currency");
    }
  }

  await reverseTransactionEffects(userId, existing);
  Object.assign(existing, payload, { currency: nextCurrency });

  if (nextType !== "transfer") {
    existing.toAccount = null;
  }

  await existing.save();

  if (existing.type === "transfer") {
    await applyBalanceDelta(userId, existing.account, -existing.amount);
    await applyBalanceDelta(userId, existing.toAccount, existing.amount);
  } else {
    await applyBalanceDelta(
      userId,
      existing.account,
      deltaForType(existing.type, existing.amount)
    );
  }
  return existing;
}

module.exports = {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  reverseTransactionEffects,
  applyBalanceDelta,
  updateAccountBalance,
  deltaForType,
};
