import assert from "node:assert/strict";
import { test } from "node:test";

process.env.AUTH_SECRET = "test-secret-for-auth-tests";

const {
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} = await import("./auth.ts");

test("hashPassword produces a verifiable, salted hash", () => {
  const hash = hashPassword("correct horse battery staple");
  assert.ok(hash.includes(":"));
  assert.equal(verifyPassword("correct horse battery staple", hash), true);
  assert.equal(verifyPassword("wrong password", hash), false);
});

test("hashPassword salts each hash differently", () => {
  const first = hashPassword("same-password");
  const second = hashPassword("same-password");
  assert.notEqual(first, second);
  assert.equal(verifyPassword("same-password", first), true);
  assert.equal(verifyPassword("same-password", second), true);
});

test("createSessionToken/verifySessionToken round-trips the account id", () => {
  const token = createSessionToken("account-123");
  assert.equal(verifySessionToken(token), "account-123");
});

test("verifySessionToken rejects tampered tokens", () => {
  const token = createSessionToken("account-123");
  const tampered = token.replace("account-123", "account-456");
  assert.equal(verifySessionToken(tampered), null);
});

test("verifySessionToken rejects malformed or missing tokens", () => {
  assert.equal(verifySessionToken(null), null);
  assert.equal(verifySessionToken(undefined), null);
  assert.equal(verifySessionToken("not-a-real-token"), null);
});
