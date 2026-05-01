const express = require("express");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/analytics.controller");

const router = express.Router();
router.use(requireAuth);

router.get("/summary", ctrl.summary);
router.get("/cashflow", ctrl.cashflow);
router.get("/categories", ctrl.categoryBreakdown);
router.get("/recent", ctrl.recent);

module.exports = router;
