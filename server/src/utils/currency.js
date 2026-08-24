const Account = require("../models/Account");

async function preferredCurrency(user) {
  const currencies = await Account.distinct("currency", {
    user: user._id,
    isArchived: false,
  });

  if (currencies.length === 1) return currencies[0];
  return user.currency || currencies[0] || "USD";
}

module.exports = { preferredCurrency };
