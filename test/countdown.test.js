import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRetryAfter, secondsLeft, DEFAULT_RETRY_SECONDS, MAX_RETRY_SECONDS } from '../src/lib/countdown.js';

test('uses retryAfterSeconds from the body first', () => {
  assert.equal(parseRetryAfter({ retryAfterSeconds: 42 }, '10'), 42);
});

test('rounds a fractional value up', () => {
  assert.equal(parseRetryAfter({ retryAfterSeconds: 4.2 }, null), 5);
});

test('falls back to the Retry-After header when the body has none', () => {
  assert.equal(parseRetryAfter({}, '17'), 17);
  assert.equal(parseRetryAfter(null, '17'), 17);
});

test('falls back to the default when neither is usable', () => {
  assert.equal(parseRetryAfter(null, null), DEFAULT_RETRY_SECONDS);
  assert.equal(parseRetryAfter({ retryAfterSeconds: 'soon' }, 'abc'), DEFAULT_RETRY_SECONDS);
  assert.equal(parseRetryAfter({ retryAfterSeconds: 0 }, '-5'), DEFAULT_RETRY_SECONDS);
});

test('caps a huge value so the UI is never locked for long', () => {
  assert.equal(parseRetryAfter({ retryAfterSeconds: 999999 }, null), MAX_RETRY_SECONDS);
});

test('secondsLeft counts down to zero and never goes negative', () => {
  assert.equal(secondsLeft(10_000, 0), 10);
  assert.equal(secondsLeft(10_000, 9_001), 1);
  assert.equal(secondsLeft(10_000, 10_000), 0);
  assert.equal(secondsLeft(10_000, 20_000), 0);
});

test('secondsLeft treats junk as no wait', () => {
  assert.equal(secondsLeft(null, 0), 0);
  assert.equal(secondsLeft(NaN, 0), 0);
});
