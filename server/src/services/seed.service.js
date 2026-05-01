const Category = require("../models/Category");
const Account = require("../models/Account");

const DEFAULT_CATEGORIES = [
  { name: "Salary", kind: "income", icon: "briefcase", color: "#10b981" },
  { name: "Bonus", kind: "income", icon: "gift", color: "#22d3ee" },
  { name: "Investments", kind: "income", icon: "trending-up", color: "#3b82f6" },
  { name: "Other Income", kind: "income", icon: "plus-circle", color: "#a855f7" },
  { name: "Food & Dining", kind: "expense", icon: "utensils", color: "#f97316" },
  { name: "Groceries", kind: "expense", icon: "shopping-cart", color: "#84cc16" },
  { name: "Transport", kind: "expense", icon: "car", color: "#0ea5e9" },
  { name: "Utilities", kind: "expense", icon: "bolt", color: "#eab308" },
  { name: "Rent", kind: "expense", icon: "home", color: "#ef4444" },
  { name: "Entertainment", kind: "expense", icon: "music", color: "#ec4899" },
  { name: "Health", kind: "expense", icon: "heart", color: "#f43f5e" },
  { name: "Shopping", kind: "expense", icon: "shopping-bag", color: "#8b5cf6" },
  { name: "Education", kind: "expense", icon: "book", color: "#06b6d4" },
  { name: "Travel", kind: "expense", icon: "plane", color: "#14b8a6" },
  { name: "Other Expense", kind: "expense", icon: "minus-circle", color: "#64748b" },
];

async function seedDefaultsForUser(userId) {
  const docs = DEFAULT_CATEGORIES.map((c) => ({ ...c, user: userId }));
  await Category.insertMany(docs, { ordered: false }).catch(() => {});
  await Account.create({
    user: userId,
    name: "Cash",
    type: "cash",
    openingBalance: 0,
    currentBalance: 0,
    icon: "wallet",
    color: "#6366f1",
  });
}

module.exports = { seedDefaultsForUser, DEFAULT_CATEGORIES };
