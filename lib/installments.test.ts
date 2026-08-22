import assert from "node:assert/strict";
import { test } from "node:test";
import { installmentIndexLabel } from "./installments.ts";

test("labels each installment by sequence, not paid count", () => {
  assert.equal(installmentIndexLabel(1, 12), "1/12");
  assert.equal(installmentIndexLabel(5, 12), "5/12");
  assert.equal(installmentIndexLabel(12, 12), "12/12");
});
