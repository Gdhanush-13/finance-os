const mongoose = require("mongoose");

const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

const recurringSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true, maxlength: 3 },
    description: { type: String, trim: true, default: "", maxlength: 240 },
    frequency: { type: String, enum: FREQUENCIES, required: true },
    interval: { type: Number, default: 1, min: 1, max: 365 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    nextRunDate: { type: Date, required: true, index: true },
    lastRunDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

recurringSchema.index({ user: 1, isActive: 1, nextRunDate: 1 });

module.exports = mongoose.model("RecurringTransaction", recurringSchema);
module.exports.FREQUENCIES = FREQUENCIES;
