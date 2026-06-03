const express = require("express");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { authLimiter, loginLimiter } = require("../middleware/rateLimit");
const ctrl = require("../controllers/auth.controller");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require("../validators/auth");

const router = express.Router();

router.post("/register", authLimiter, validate({ body: registerSchema }), ctrl.register);
router.post("/login", loginLimiter, validate({ body: loginSchema }), ctrl.login);
router.get("/me", requireAuth, ctrl.me);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
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
