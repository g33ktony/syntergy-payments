import assert from "node:assert/strict";
import { test } from "node:test";
import { groupBySequence, installmentIndexLabel } from "./installments.ts";

test("labels each installment by sequence, not paid count", () => {
  assert.equal(installmentIndexLabel(1, 12), "1/12");
  assert.equal(installmentIndexLabel(5, 12), "5/12");
  assert.equal(installmentIndexLabel(12, 12), "12/12");
});

test("groupBySequence keeps only the earliest unpaid installment visible per obligation", () => {
  const items = [
    { id: "a-3", obligationId: "a", sequence: 3 },
    { id: "b-1", obligationId: "b", sequence: 1 },
    { id: "a-4", obligationId: "a", sequence: 4 },
    { id: "a-5", obligationId: "a", sequence: 5 },
  ];
  const groups = groupBySequence(
    items,
    (item) => item.obligationId,
    (item) => item.sequence,
  );

  assert.equal(groups.length, 2);
  assert.equal(groups[0].primary.id, "a-3");
  assert.deepEqual(
    groups[0].rest.map((item) => item.id),
    ["a-4", "a-5"],
  );
  assert.equal(groups[1].primary.id, "b-1");
  assert.equal(groups[1].rest.length, 0);
});

test("groupBySequence preserves the group's position from its first-seen item", () => {
  const items = [
    { id: "b-1", obligationId: "b", sequence: 1 },
    { id: "a-3", obligationId: "a", sequence: 3 },
    { id: "b-2", obligationId: "b", sequence: 2 },
  ];
  const groups = groupBySequence(
    items,
    (item) => item.obligationId,
    (item) => item.sequence,
  );

  assert.equal(groups[0].primary.id, "b-1");
  assert.equal(groups[1].primary.id, "a-3");
});
