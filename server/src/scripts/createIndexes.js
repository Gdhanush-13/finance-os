const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const RecurringTransaction = require("../models/RecurringTransaction");
const Category = require("../models/Category");

async function createIndexes() {
  try {
    console.log("Creating MongoDB indexes...");

    // Transaction indexes for common queries
    await Transaction.createIndexes([
      { user: 1, date: -1 }, // User transactions sorted by date
      { user: 1, account: 1 }, // User transactions by account
      { user: 1, category: 1 }, // User transactions by category
      { user: 1, type: 1 }, // User transactions by type
      { user: 1, date: -1, type: 1 }, // User transactions by date and type
    ]);

    // Account indexes
    await Account.createIndexes([
      { user: 1, name: 1 }, // User accounts by name
      { user: 1, type: 1 }, // User accounts by type
    ]);

    // Budget indexes
    await Budget.createIndexes([
      { user: 1, category: 1 }, // User budgets by category
      { user: 1, period: 1, startDate: -1 }, // User budgets by period and start date
    ]);

    // Goal indexes
    await Goal.createIndexes([
      { user: 1, isAchieved: 1 }, // User goals by achievement status
      { user: 1, deadline: 1 }, // User goals by deadline
    ]);

    // Recurring transaction indexes
    await RecurringTransaction.createIndexes([
      { user: 1, isActive: 1, nextRunDate: 1 }, // Active recurring rules by next run date
      { user: 1, frequency: 1 }, // User recurring rules by frequency
    ]);

    // Category indexes
    await Category.createIndexes([
      { user: 1, kind: 1 }, // User categories by kind (income/expense)
      { user: 1, name: 1 }, // User categories by name
    ]);

    console.log("All indexes created successfully!");
  } catch (error) {
    console.error("Error creating indexes:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  require("dotenv").config();
  require("../config/env");
  mongoose.connect(process.env.MONGO_URI).then(() => {
    createIndexes();
  });
}

module.exports = createIndexes;
