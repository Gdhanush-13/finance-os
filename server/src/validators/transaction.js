const { z } = require("zod");
const { TRANSACTION_TYPES } = require("../models/Transaction");
const { objectId } = require("./common");

const createTransactionSchema = z
  .object({
    account: objectId,
    toAccount: objectId.optional().nullable(),
    category: objectId.optional().nullable(),
    type: z.enum(TRANSACTION_TYPES),
    amount: z.coerce.number().positive(),
    currency: z.string().trim().toUpperCase().length(3).optional(),
    description: z.string().trim().max(240).optional().default(""),
    notes: z.string().trim().max(1000).optional().default(""),
    tags: z.array(z.string().trim().min(1).max(30)).optional().default([]),
    date: z.coerce.date(),
  })
  .refine(
    (v) => v.type !== "transfer" || (v.toAccount && v.toAccount !== v.account),
    {
      message: "transfer requires toAccount different from account",
      path: ["toAccount"],
    }
  );

const updateTransactionSchema = z
  .object({
    account: objectId.optional(),
    toAccount: objectId.optional().nullable(),
    category: objectId.optional().nullable(),
    type: z.enum(TRANSACTION_TYPES).optional(),
    amount: z.coerce.number().positive().optional(),
    currency: z.string().trim().toUpperCase().length(3).optional(),
    description: z.string().trim().max(240).optional(),
    notes: z.string().trim().max(1000).optional(),
    tags: z.array(z.string().trim().min(1).max(30)).optional(),
    date: z.coerce.date().optional(),
  })
  .strict();

const listTransactionsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(25),
  type: z.enum(TRANSACTION_TYPES).optional(),
  account: objectId.optional(),
  category: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sort: z.enum(["date", "-date", "amount", "-amount"]).default("-date"),
});

const transferSchema = z
  .object({
    account: objectId,
    toAccount: objectId,
    amount: z.coerce.number().positive(),
    currency: z.string().trim().toUpperCase().length(3).optional(),
    description: z.string().trim().max(240).optional().default(""),
    notes: z.string().trim().max(1000).optional().default(""),
    date: z.coerce.date(),
  })
  .refine((v) => v.toAccount !== v.account, {
    message: "toAccount must be different from account",
    path: ["toAccount"],
  });

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuery,
  transferSchema,
};
