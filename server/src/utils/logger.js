/* eslint-disable no-console */
const env = require("../config/env");

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = env.isProd ? "info" : "debug";

function log(level, ...args) {
  if (levels[level] > levels[currentLevel]) return;
  const ts = new Date().toISOString();
  const tag = `[${ts}] [${level.toUpperCase()}]`;
  if (level === "error") console.error(tag, ...args);
  else if (level === "warn") console.warn(tag, ...args);
  else console.log(tag, ...args);
}

module.exports = {
  info: (...a) => log("info", ...a),
  warn: (...a) => log("warn", ...a),
  error: (...a) => log("error", ...a),
  debug: (...a) => log("debug", ...a),
};
