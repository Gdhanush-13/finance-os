const mongoose = require("mongoose");

const CATEGORY_KINDS = ["income", "expense"];

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    kind: { type: String, enum: CATEGORY_KINDS, required: true },
    color: { type: String, default: "#6366f1" },
    icon: { type: String, default: "tag" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1, kind: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
module.exports.CATEGORY_KINDS = CATEGORY_KINDS;
