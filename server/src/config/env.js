const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGINS: z.string().optional(),
  REFRESH_TOKEN_SECRET: z.string().min(16).optional(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    // eslint-disable-next-line no-console
    console.error(`\nInvalid environment configuration:\n${issues}\n`);
    process.exit(1);
  }
  const env = parsed.data;
  const isProd = env.NODE_ENV === "production";
  const corsRaw = env.CORS_ORIGINS || (isProd ? "" : "*");
  if (isProd && (!corsRaw || corsRaw === "*")) {
    // eslint-disable-next-line no-console
    console.error("\n[env] CORS_ORIGINS must be set explicitly in production.\n");
    process.exit(1);
  }
  return {
    ...env,
    isProd,
    isTest: env.NODE_ENV === "test",
    isDev: env.NODE_ENV === "development",
    corsOrigins: corsRaw.split(",").map((s) => s.trim()).filter(Boolean),
    refreshTokenSecret: env.REFRESH_TOKEN_SECRET || env.JWT_SECRET + "_refresh",
    refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    accessTokenExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
  };
}

module.exports = loadEnv();
