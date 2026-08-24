const mongoose = require("mongoose");

const BUDGET_PERIODS = ["monthly", "weekly", "yearly"];

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, uppercase: true, maxlength: 3 },
    period: { type: String, enum: BUDGET_PERIODS, default: "monthly" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    alertThreshold: { type: Number, default: 0.8, min: 0, max: 1 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, period: 1, startDate: -1 });

module.exports = mongoose.model("Budget", budgetSchema);
module.exports.BUDGET_PERIODS = BUDGET_PERIODS;
