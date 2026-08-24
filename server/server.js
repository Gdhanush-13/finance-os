require("dotenv").config();
const env = require("./src/config/env");
const buildApp = require("./src/app");
const { connectDB } = require("./src/config/db");
const logger = require("./src/utils/logger");
const { startCronJobs } = require("./src/services/cron");

async function start() {
  try {
    await connectDB();
    logger.info("MongoDB connected successfully");
    if (!env.isTest) startCronJobs();
  } catch (err) {
    logger.error("MongoDB connection failed; refusing to start an unusable API", err);
    process.exit(1);
  }

  try {
    const app = buildApp();
    const server = app.listen(env.PORT, () => {
      logger.info(
        `Finance OS API running in ${env.NODE_ENV} mode on port ${env.PORT}`
      );
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down...`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10_000).unref();
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
