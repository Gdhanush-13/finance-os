const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const Category = require("../models/Category");

exports.list = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.kind) filter.kind = req.query.kind;
  const categories = await Category.find(filter).sort({ kind: 1, name: 1 });
  res.json({ success: true, data: categories });
});

exports.create = asyncHandler(async (req, res) => {
  const category = await Category.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: category });
});

exports.update = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!category) throw ApiError.notFound("Category not found");
  res.json({ success: true, data: category });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await Category.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!result) throw ApiError.notFound("Category not found");
  res.json({ success: true, data: { message: "Category deleted" } });
});
