const cron = require("node-cron");
const RecurringTransaction = require("../models/RecurringTransaction");
const { processDueForUser } = require("./recurring.service");
const logger = require("../utils/logger");

function startCronJobs() {
  // Run every day at midnight — process all due recurring transactions
  cron.schedule("0 0 * * *", async () => {
    logger.info("[cron] Running recurring transactions job...");
    try {
      const users = await RecurringTransaction.distinct("user", { isActive: true });
      let total = 0;
      for (const userId of users) {
        const result = await processDueForUser(userId);
        total += result.transactionsCreated;
      }
      logger.info(`[cron] Done — ${total} transactions created across ${users.length} users`);
    } catch (err) {
      logger.error("[cron] Recurring job failed", err.message);
    }
  });

  logger.info("[cron] Scheduled recurring transactions job (daily at midnight)");
}

module.exports = { startCronJobs };
