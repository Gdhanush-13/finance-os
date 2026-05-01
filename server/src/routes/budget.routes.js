const express = require("express");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/budget.controller");
const { idParam } = require("../validators/common");
const {
  createBudgetSchema,
  updateBudgetSchema,
} = require("../validators/budget");

const router = express.Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.post("/", validate({ body: createBudgetSchema }), ctrl.create);
router.patch(
  "/:id",
  validate({ params: idParam, body: updateBudgetSchema }),
  ctrl.update
);
router.delete("/:id", validate({ params: idParam }), ctrl.remove);

module.exports = router;
