const { z } = require("zod");
const { CATEGORY_KINDS } = require("../models/Category");

const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(60),
  kind: z.enum(CATEGORY_KINDS),
  color: z.string().trim().optional(),
  icon: z.string().trim().optional(),
});

const updateCategorySchema = createCategorySchema.partial().extend({
  isArchived: z.boolean().optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };
