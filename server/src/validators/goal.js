const { z } = require("zod");

const createGoalSchema = z.object({
  name: z.string().trim().min(1).max(80),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0).optional(),
  currency: z.string().trim().toUpperCase().length(3).optional(),
  deadline: z.coerce.date().optional().nullable(),
  color: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  note: z.string().trim().max(500).optional(),
});

const updateGoalSchema = createGoalSchema.partial().extend({
  isAchieved: z.boolean().optional(),
});

const contributeSchema = z.object({
  amount: z.coerce.number().positive(),
});

module.exports = { createGoalSchema, updateGoalSchema, contributeSchema };
