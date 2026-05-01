const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/category.controller");
const { idParam } = require("../validators/common");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/category");

const router = express.Router();
router.use(requireAuth);

const listQuery = z.object({
  kind: z.enum(["income", "expense"]).optional(),
});

router.get("/", validate({ query: listQuery }), ctrl.list);
router.post("/", validate({ body: createCategorySchema }), ctrl.create);
router.patch(
  "/:id",
  validate({ params: idParam, body: updateCategorySchema }),
  ctrl.update
);
router.delete("/:id", validate({ params: idParam }), ctrl.remove);

module.exports = router;
