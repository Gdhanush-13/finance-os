const { z } = require("zod");
const { ACCOUNT_TYPES } = require("../models/Account");

const createAccountSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(ACCOUNT_TYPES).default("bank"),
  currency: z.string().trim().toUpperCase().length(3).optional(),
  openingBalance: z.coerce.number().default(0),
  institution: z.string().trim().max(80).optional().default(""),
  color: z.string().trim().optional(),
  icon: z.string().trim().optional(),
});

const updateAccountSchema = createAccountSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

module.exports = { createAccountSchema, updateAccountSchema };
