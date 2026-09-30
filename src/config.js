"use strict";

const fs = require("fs");
const path = require("path");

const REQUIRED = [
  "LASTFM_USER",
  "LASTFM_API_KEY",
  "DISCORD_APP_ID",
  "DISCORD_USER_ID",
  "DISCORD_BOT_TOKEN",
];

const DEFAULT_PROFILE = {
  username: "",
  title: "",
  subtitle: "",
  labels: {},
  miniText: "",
  activity: "Personal Profile",
};

function readInt(env, name, fallback, min) {
  const raw = env[name];
  if (raw === undefined || String(raw).trim() === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < min) {
    throw new Error(`${name} must be a whole number >= ${min} (got "${raw}")`);
  }
  return n;
}

function loadProfile(file) {
  if (!fs.existsSync(file)) return { ...DEFAULT_PROFILE };
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`profile.json is not valid JSON: ${err.message}`);
  }
  return { ...DEFAULT_PROFILE, ...parsed };
}

/**
 * Reads and validates configuration. Throws one readable Error listing every
 * problem, so a misconfigured host fails fast with a clear message.
 */
function loadConfig(env = process.env, profileFile = path.join(__dirname, "..", "profile.json")) {
  const problems = [];

  for (const name of REQUIRED) {
    const value = (env[name] || "").trim();
    if (!value) problems.push(`${name} is missing`);
    else if (value.startsWith("your_")) problems.push(`${name} is still the placeholder from .env.example`);
  }

  const forceMode = (env.FORCE_MODE || "").trim().toLowerCase();
  if (forceMode && !["music", "personal"].includes(forceMode)) {
    problems.push(`FORCE_MODE must be "music" or "personal" (got "${env.FORCE_MODE}")`);
  }

  let intervalSec;
  let statsTtlSec;
  try {
    intervalSec = readInt(env, "UPDATE_INTERVAL", 30, 10);
    statsTtlSec = readInt(env, "STATS_TTL", 300, 30);
  } catch (err) {
    problems.push(err.message);
  }

  if (problems.length) {
    throw new Error(`Invalid configuration:\n  - ${problems.join("\n  - ")}`);
  }

  const lastfmUser = env.LASTFM_USER.trim();
  const profile = loadProfile(profileFile);
  if (!profile.username) profile.username = lastfmUser;

  return {
    lastfmUser,
    lastfmApiKey: env.LASTFM_API_KEY.trim(),
    discordAppId: env.DISCORD_APP_ID.trim(),
    discordUserId: env.DISCORD_USER_ID.trim(),
    discordBotToken: env.DISCORD_BOT_TOKEN.trim(),
    forceMode: forceMode || null,
    intervalMs: intervalSec * 1000,
    statsTtlMs: statsTtlSec * 1000,
    profile,
  };
}

module.exports = { loadConfig, REQUIRED };
