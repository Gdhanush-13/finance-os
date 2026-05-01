const express = require("express");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/transaction.controller");
const { idParam } = require("../validators/common");
const {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuery,
} = require("../validators/transaction");

const router = express.Router();
router.use(requireAuth);

router.get("/", validate({ query: listTransactionsQuery }), ctrl.list);
router.post("/", validate({ body: createTransactionSchema }), ctrl.create);
router.get("/:id", validate({ params: idParam }), ctrl.get);
router.patch(
  "/:id",
  validate({ params: idParam, body: updateTransactionSchema }),
  ctrl.update
);
router.delete("/:id", validate({ params: idParam }), ctrl.remove);

module.exports = router;
