"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createRunner, HEARTBEAT_MS } = require("../src/runner");

const silent = { info() {}, warn() {}, error() {} };
const stats = { playcount: 1, loved: 1, friends: 1, tracks: 1, albums: 1, artists: 1 };
const profile = { username: "u", title: "T", subtitle: "S", labels: {}, miniText: "", activity: "A" };
const config = { lastfmUser: "me", forceMode: null, intervalMs: 30000, profile };

function setup({ track, forceMode = null } = {}) {
  const sent = [];
  let clock = 0;
  let current = track;
  const lastfm = {
    calls: 0,
    async getNowPlaying() {
      this.calls += 1;
      return current;
    },
    async getStats() {
      return stats;
    },
  };
  const discord = {
    fail: null,
    async updateProfile(payload) {
      if (this.fail) throw this.fail;
      sent.push(payload);
    },
  };
  const runner = createRunner({ config: { ...config, forceMode }, lastfm, discord, logger: silent, now: () => clock });
  return { runner, sent, discord, lastfm, advance: (ms) => (clock += ms), setTrack: (t) => (current = t) };
}

const playing = { name: "S", artist: "A", album: "L", cover: "", isNowPlaying: true };
const idle = { ...playing, isNowPlaying: false };

test("sends music payload while playing and personal payload when idle", async () => {
  const t = setup({ track: playing });
  await t.runner.tick();
  t.setTrack(idle);
  await t.runner.tick();
  assert.equal(t.sent.length, 2);
  assert.equal(t.sent[0].username, "me");
  assert.equal(t.sent[1].username, "u");
});

test("does not re-send an unchanged profile until the heartbeat is due", async () => {
  const t = setup({ track: playing });
  await t.runner.tick();
  await t.runner.tick();
  assert.equal(t.sent.length, 1);
  t.advance(HEARTBEAT_MS);
  await t.runner.tick();
  assert.equal(t.sent.length, 2);
});

test("forced personal mode never calls Last.fm", async () => {
  const t = setup({ track: playing, forceMode: "personal" });
  await t.runner.tick();
  assert.equal(t.lastfm.calls, 0);
  assert.equal(t.sent[0].username, "u");
});

test("errors back off exponentially and reset after success", async () => {
  const t = setup({ track: playing });
  t.discord.fail = new Error("boom");
  assert.equal(await t.runner.tick(), 60000);
  assert.equal(await t.runner.tick(), 120000);
  t.discord.fail = null;
  assert.equal(await t.runner.tick(), 30000);
  t.discord.fail = new Error("boom");
  t.setTrack({ ...playing, name: "Other" });
  assert.equal(await t.runner.tick(), 60000);
});

test("rate limit retry_after is respected", async () => {
  const t = setup({ track: playing });
  t.discord.fail = Object.assign(new Error("429"), { retryAfterMs: 200000 });
  assert.equal(await t.runner.tick(), 200000);
});

test("a failed send is retried with the same payload", async () => {
  const t = setup({ track: playing });
  t.discord.fail = new Error("boom");
  await t.runner.tick();
  t.discord.fail = null;
  await t.runner.tick();
  assert.equal(t.sent.length, 1);
});
