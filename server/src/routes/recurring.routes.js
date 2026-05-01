const express = require("express");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/recurring.controller");
const { idParam } = require("../validators/common");
const {
  createRecurringSchema,
  updateRecurringSchema,
} = require("../validators/recurring");

const router = express.Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.post("/", validate({ body: createRecurringSchema }), ctrl.create);
router.patch(
  "/:id",
  validate({ params: idParam, body: updateRecurringSchema }),
  ctrl.update
);
router.delete("/:id", validate({ params: idParam }), ctrl.remove);
router.post("/run-now", ctrl.runNow);

module.exports = router;
