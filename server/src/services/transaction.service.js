const ApiError = require("../utils/ApiError");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

async function applyBalanceDelta(userId, accountId, delta) {
  const account = await Account.findOne({ _id: accountId, user: userId });
  if (!account) throw ApiError.badRequest("Account not found");
  account.currentBalance += delta;
  await account.save();
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
  const tx = await Transaction.create({ ...payload, user: userId });
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
  const tx = await Transaction.findOne({ _id: id, user: userId });
  if (!tx) throw ApiError.notFound("Transaction not found");
  await reverseTransactionEffects(userId, tx);
  await tx.deleteOne();
  return { _id: id };
}

async function updateTransaction(userId, id, payload) {
  const existing = await Transaction.findOne({ _id: id, user: userId });
  if (!existing) throw ApiError.notFound("Transaction not found");
  await reverseTransactionEffects(userId, existing);

  Object.assign(existing, payload);

  if (existing.type === "transfer") {
    if (!existing.toAccount || String(existing.toAccount) === String(existing.account)) {
      throw ApiError.badRequest("Transfer requires distinct toAccount");
    }
  } else {
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
  deltaForType,
};
