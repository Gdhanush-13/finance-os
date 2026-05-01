const express = require("express");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const ctrl = require("../controllers/auth.controller");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require("../validators/auth");

const router = express.Router();

router.post("/register", authLimiter, validate({ body: registerSchema }), ctrl.register);
router.post("/login", authLimiter, validate({ body: loginSchema }), ctrl.login);
router.get("/me", requireAuth, ctrl.me);
router.patch(
  "/profile",
  requireAuth,
  validate({ body: updateProfileSchema }),
  ctrl.updateProfile
);
router.post(
  "/change-password",
  requireAuth,
  validate({ body: changePasswordSchema }),
  ctrl.changePassword
);

module.exports = router;
