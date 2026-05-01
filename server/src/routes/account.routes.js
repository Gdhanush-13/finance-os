const express = require("express");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/account.controller");
const { idParam } = require("../validators/common");
const {
  createAccountSchema,
  updateAccountSchema,
} = require("../validators/account");

const router = express.Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.post("/", validate({ body: createAccountSchema }), ctrl.create);
router.get("/:id", validate({ params: idParam }), ctrl.get);
router.patch(
  "/:id",
  validate({ params: idParam, body: updateAccountSchema }),
  ctrl.update
);
router.delete("/:id", validate({ params: idParam }), ctrl.remove);

module.exports = router;
