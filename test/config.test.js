"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadConfig } = require("../src/config");

const noProfile = path.join(__dirname, "does-not-exist.json");
const good = {
  LASTFM_USER: "someone",
  LASTFM_API_KEY: "key",
  DISCORD_APP_ID: "1",
  DISCORD_USER_ID: "2",
  DISCORD_BOT_TOKEN: "token",
};

test("valid env loads with defaults", () => {
  const c = loadConfig(good, noProfile);
  assert.equal(c.intervalMs, 30000);
  assert.equal(c.statsTtlMs, 300000);
  assert.equal(c.forceMode, null);
  assert.equal(c.profile.username, "someone");
});

test("missing and placeholder values are reported together", () => {
  assert.throws(
    () => loadConfig({ ...good, LASTFM_API_KEY: "", DISCORD_BOT_TOKEN: "your_bot_token" }, noProfile),
    (err) => /LASTFM_API_KEY is missing/.test(err.message) && /DISCORD_BOT_TOKEN is still the placeholder/.test(err.message),
  );
});

test("optional settings are validated", () => {
  assert.throws(() => loadConfig({ ...good, FORCE_MODE: "loud" }, noProfile), /FORCE_MODE/);
  assert.throws(() => loadConfig({ ...good, UPDATE_INTERVAL: "2" }, noProfile), /UPDATE_INTERVAL/);
  assert.equal(loadConfig({ ...good, FORCE_MODE: "Music", UPDATE_INTERVAL: "60" }, noProfile).forceMode, "music");
});
