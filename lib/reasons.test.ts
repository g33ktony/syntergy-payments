import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildBuckets,
  distributeAbono,
  reasonsTotal,
  remainingAmount,
  totalPaid,
} from "./reasons.ts";

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

test("buildBuckets appends the unassigned remainder as a trailing bucket", () => {
  const buckets = buildBuckets(
    1200,
    [
      { id: "luz", label: "Luz", amount: 300, paidAmount: 0 },
      { id: "gas", label: "Gas", amount: 600, paidAmount: 0 },
    ],
    0,
    "Sin motivo",
  );
  assert.deepEqual(buckets, [
    { id: "luz", label: "Luz", amount: 300, paidAmount: 0 },
    { id: "gas", label: "Gas", amount: 600, paidAmount: 0 },
    { id: "unassigned", label: "Sin motivo", amount: 300, paidAmount: 0 },
  ]);
});

test("buildBuckets omits the unassigned bucket once fully assigned", () => {
  const buckets = buildBuckets(
    900,
    [{ id: "luz", label: "Luz", amount: 900, paidAmount: 0 }],
    0,
    "Sin motivo",
  );
  assert.equal(buckets.length, 1);
});

test("distributeAbono fills buckets in order, fully covering what it can", () => {
  const buckets = buildBuckets(
    1200,
    [
      { id: "luz", label: "Luz", amount: 300, paidAmount: 0 },
      { id: "gas", label: "Gas", amount: 600, paidAmount: 0 },
    ],
    0,
    "Internet",
  );
  const updated = distributeAbono(buckets, 900);
  // abono of 900 covers luz (300) and gas (600) fully, leaves internet untouched
  assert.deepEqual(updated, [
    { id: "luz", label: "Luz", amount: 300, paidAmount: 300 },
    { id: "gas", label: "Gas", amount: 600, paidAmount: 600 },
    { id: "unassigned", label: "Internet", amount: 300, paidAmount: 0 },
  ]);
  assert.equal(totalPaid(updated), 900);
});

test("distributeAbono partially covers the second bucket when the abono runs out", () => {
  const buckets = buildBuckets(
    1200,
    [
      { id: "luz", label: "Luz", amount: 300, paidAmount: 0 },
      { id: "gas", label: "Gas", amount: 600, paidAmount: 0 },
    ],
    0,
    "Internet",
  );
  const updated = distributeAbono(buckets, 400);
  assert.deepEqual(updated, [
    { id: "luz", label: "Luz", amount: 300, paidAmount: 300 },
    { id: "gas", label: "Gas", amount: 600, paidAmount: 100 },
    { id: "unassigned", label: "Internet", amount: 300, paidAmount: 0 },
  ]);
});

test("distributeAbono skips already-paid buckets and keeps applying to the next", () => {
  const buckets = buildBuckets(
    1200,
    [
      { id: "luz", label: "Luz", amount: 300, paidAmount: 300 },
      { id: "gas", label: "Gas", amount: 600, paidAmount: 100 },
    ],
    0,
    "Internet",
  );
  const updated = distributeAbono(buckets, 700);
  assert.deepEqual(updated, [
    { id: "luz", label: "Luz", amount: 300, paidAmount: 300 },
    { id: "gas", label: "Gas", amount: 600, paidAmount: 600 },
    { id: "unassigned", label: "Internet", amount: 300, paidAmount: 200 },
  ]);
});
