const express = require("express");

const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/accounts", require("./account.routes"));
router.use("/categories", require("./category.routes"));
router.use("/transactions", require("./transaction.routes"));
router.use("/budgets", require("./budget.routes"));
router.use("/goals", require("./goal.routes"));
router.use("/analytics", require("./analytics.routes"));
router.use("/recurring", require("./recurring.routes"));
router.use("/transactions-io", require("./import.routes"));

module.exports = router;
