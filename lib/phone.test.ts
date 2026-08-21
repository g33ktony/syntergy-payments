import assert from "node:assert/strict";
import { test } from "node:test";
import { whatsappHref } from "./phone.ts";

test("returns null for missing or too-short numbers", () => {
  assert.equal(whatsappHref(""), null);
  assert.equal(whatsappHref("123"), null);
  assert.equal(whatsappHref("   "), null);
});

test("builds wa.me from a 10-digit Mexican mobile with country code 52", () => {
  assert.equal(whatsappHref("55 1234 5678"), "https://wa.me/525512345678");
});

test("keeps an existing 52 country code", () => {
  assert.equal(whatsappHref("+52 55 1234 5678"), "https://wa.me/525512345678");
});

test("keeps a full international number as-is", () => {
  assert.equal(whatsappHref("+1 (415) 555-2671"), "https://wa.me/14155552671");
});
