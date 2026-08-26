import assert from "node:assert/strict";
import { test } from "node:test";
import { reasonsTotal, remainingAmount } from "./reasons.ts";

test("sums reason amounts", () => {
  assert.equal(reasonsTotal([]), 0);
  assert.equal(reasonsTotal([{ amount: 50000 }, { amount: 8500 }]), 58500);
});

test("remaining is the installment amount minus assigned reasons", () => {
  assert.equal(remainingAmount(135000, []), 135000);
  assert.equal(remainingAmount(135000, [{ amount: 50000 }]), 85000);
  assert.equal(
    remainingAmount(135000, [{ amount: 50000 }, { amount: 85000 }]),
    0,
  );
});

test("remaining never goes negative even if reasons over-allocate", () => {
  assert.equal(remainingAmount(100, [{ amount: 60 }, { amount: 60 }]), 0);
});
