const { z } = require("zod");

const objectIdRegex = /^[a-f\d]{24}$/i;
const objectId = z
  .string()
  .regex(objectIdRegex, "Invalid id");

const idParam = z.object({ id: objectId });

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(25),
});

module.exports = { objectId, idParam, paginationQuery };
