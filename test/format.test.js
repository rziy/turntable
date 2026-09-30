"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { formatNumber } = require("../src/format");

test("formatNumber compacts large numbers", () => {
  assert.equal(formatNumber(0), "0");
  assert.equal(formatNumber("999"), "999");
  assert.equal(formatNumber(1000), "1K");
  assert.equal(formatNumber(1234), "1.2K");
  assert.equal(formatNumber(10500), "10.5K");
  assert.equal(formatNumber(999950), "1M");
  assert.equal(formatNumber(2500000), "2.5M");
});

test("formatNumber tolerates bad input", () => {
  assert.equal(formatNumber(undefined), "0");
  assert.equal(formatNumber("abc"), "0");
  assert.equal(formatNumber(-5), "0");
});
