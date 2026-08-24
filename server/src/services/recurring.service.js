const dayjs = require("dayjs");
const RecurringTransaction = require("../models/RecurringTransaction");
const txService = require("./transaction.service");

function advance(date, frequency, interval = 1) {
  const d = dayjs(date);
  if (frequency === "daily") return d.add(interval, "day").toDate();
  if (frequency === "weekly") return d.add(interval, "week").toDate();
  if (frequency === "monthly") return d.add(interval, "month").toDate();
  return d.add(interval, "year").toDate();
}

async function processDueForUser(userId, asOf = new Date()) {
  const due = await RecurringTransaction.find({
    user: userId,
    isActive: true,
    nextRunDate: { $lte: asOf },
  });
  let created = 0;
  for (const r of due) {
    while (r.isActive && r.nextRunDate <= asOf) {
      if (r.endDate && r.nextRunDate > r.endDate) {
        r.isActive = false;
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      await txService.createTransaction(userId, {
        account: r.account,
        toAccount: r.toAccount,
        category: r.category,
        type: r.type,
        amount: r.amount,
        description: r.description,
        date: r.nextRunDate,
        recurring: r._id,
        tags: [],
      });
      created += 1;
      r.lastRunDate = r.nextRunDate;
      r.nextRunDate = advance(r.nextRunDate, r.frequency, r.interval);
    }
    // eslint-disable-next-line no-await-in-loop
    await r.save();
  }
  return { processed: due.length, transactionsCreated: created };
}

module.exports = { processDueForUser, advance };
