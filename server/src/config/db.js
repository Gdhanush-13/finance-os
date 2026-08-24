const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

mongoose.set("strictQuery", true);
// Never queue requests against a disconnected database. A queued auth query
// used to hang for 10 seconds and then surface as an internal server error.
mongoose.set("bufferCommands", false);

async function connectDB(uri = env.MONGO_URI) {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      autoIndex: !env.isProd,
    });
    logger.info("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    logger.error("MongoDB connection failed", error);
    throw error;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
