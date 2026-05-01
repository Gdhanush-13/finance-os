const express = require("express");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/goal.controller");
const { idParam } = require("../validators/common");
const {
  createGoalSchema,
  updateGoalSchema,
  contributeSchema,
} = require("../validators/goal");

const router = express.Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.post("/", validate({ body: createGoalSchema }), ctrl.create);
router.patch(
  "/:id",
  validate({ params: idParam, body: updateGoalSchema }),
  ctrl.update
);
router.post(
  "/:id/contribute",
  validate({ params: idParam, body: contributeSchema }),
  ctrl.contribute
);
router.delete("/:id", validate({ params: idParam }), ctrl.remove);

module.exports = router;
