"use strict";

/**
 * Turns an axios/network error into one safe log line.
 * It never prints request config, so API keys and tokens cannot leak into logs.
 */
function describeError(err) {
  const parts = [err && err.message ? err.message : String(err)];
  const res = err && err.response;

  if (res) {
    parts.push(`(HTTP ${res.status})`);
    if (res.data && typeof res.data === "object") {
      try {
        parts.push(JSON.stringify(res.data).slice(0, 300));
      } catch {
        /* ignore unserialisable bodies */
      }
    }
  } else if (err && err.code) {
    parts.push(`(${err.code})`);
  }

  if (err && err.hint) parts.push(`- ${err.hint}`);
  return parts.join(" ");
}

module.exports = { describeError };
