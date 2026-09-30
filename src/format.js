"use strict";

function compact(n, divisor, suffix) {
  return `${(n / divisor).toFixed(1).replace(/\.0$/, "")}${suffix}`;
}

/** 1234 -> "1.2K", 2_500_000 -> "2.5M". Invalid input -> "0". */
function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n >= 1e6) return compact(n, 1e6, "M");
  if (n >= 1e3) {
    // 999_950 would round to "1000K"; promote it to "1M" instead.
    return Math.round(n / 100) / 10 >= 1000 ? "1M" : compact(n, 1e3, "K");
  }
  return String(Math.trunc(n));
}

module.exports = { formatNumber };
