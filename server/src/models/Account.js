const mongoose = require("mongoose");

const ACCOUNT_TYPES = [
  "cash",
  "bank",
  "credit_card",
  "investment",
  "loan",
  "wallet",
  "other",
];

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, enum: ACCOUNT_TYPES, default: "bank" },
    currency: { type: String, default: "USD", uppercase: true, maxlength: 3 },
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    institution: { type: String, trim: true, default: "" },
    color: { type: String, default: "#6366f1" },
    icon: { type: String, default: "wallet" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

accountSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model("Account", accountSchema);
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
