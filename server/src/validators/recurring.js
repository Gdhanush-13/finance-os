const { z } = require("zod");
const { FREQUENCIES } = require("../models/RecurringTransaction");
const { TRANSACTION_TYPES } = require("../models/Transaction");
const { objectId } = require("./common");

const createRecurringSchema = z
  .object({
    account: objectId,
    toAccount: objectId.optional().nullable(),
    category: objectId.optional().nullable(),
    type: z.enum(TRANSACTION_TYPES),
    amount: z.coerce.number().positive(),
    currency: z.string().trim().toUpperCase().length(3).optional(),
    description: z.string().trim().max(240).optional().default(""),
    frequency: z.enum(FREQUENCIES),
    interval: z.coerce.number().int().min(1).max(365).default(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
  })
  .refine(
    (v) => v.type !== "transfer" || (v.toAccount && v.toAccount !== v.account),
    {
      message: "transfer requires toAccount different from account",
      path: ["toAccount"],
    }
  );

const updateRecurringSchema = z
  .object({
    account: objectId.optional(),
    toAccount: objectId.optional().nullable(),
    category: objectId.optional().nullable(),
    type: z.enum(TRANSACTION_TYPES).optional(),
    amount: z.coerce.number().positive().optional(),
    currency: z.string().trim().toUpperCase().length(3).optional(),
    description: z.string().trim().max(240).optional(),
    frequency: z.enum(FREQUENCIES).optional(),
    interval: z.coerce.number().int().min(1).max(365).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .strict();

module.exports = { createRecurringSchema, updateRecurringSchema };
