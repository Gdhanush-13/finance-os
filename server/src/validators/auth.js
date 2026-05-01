const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  currency: z.string().trim().toUpperCase().length(3).optional(),
  timezone: z.string().trim().min(1).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
