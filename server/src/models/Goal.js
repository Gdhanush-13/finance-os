const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "USD", uppercase: true, maxlength: 3 },
    deadline: { type: Date, default: null },
    color: { type: String, default: "#10b981" },
    icon: { type: String, default: "target" },
    note: { type: String, trim: true, default: "", maxlength: 500 },
    isAchieved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
