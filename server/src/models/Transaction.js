const mongoose = require("mongoose");

const TRANSACTION_TYPES = ["income", "expense", "transfer"];

const transactionSchema = new mongoose.Schema(
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
      index: true,
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
      index: true,
    },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", uppercase: true, maxlength: 3 },
    description: { type: String, trim: true, default: "", maxlength: 240 },
    notes: { type: String, trim: true, default: "", maxlength: 1000 },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
    date: { type: Date, required: true, index: true },
    recurring: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringTransaction",
      default: null,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, account: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
module.exports.TRANSACTION_TYPES = TRANSACTION_TYPES;
