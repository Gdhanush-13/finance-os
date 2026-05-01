const { z } = require("zod");
const { BUDGET_PERIODS } = require("../models/Budget");
const { objectId } = require("./common");

const createBudgetSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: objectId.optional().nullable(),
  amount: z.coerce.number().positive(),
  period: z.enum(BUDGET_PERIODS).default("monthly"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  alertThreshold: z.coerce.number().min(0).max(1).optional(),
});

const updateBudgetSchema = createBudgetSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

module.exports = { createBudgetSchema, updateBudgetSchema };
