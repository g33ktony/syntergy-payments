import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword, verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function getCurrentAccountId() {
  const jar = await cookies();
  const accountId = verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!accountId) {
    throw new Error("Not authenticated");
  }
  return accountId;
}

// One-time bootstrap: the app used to gate access with a single shared
// APP_PASSWORD and no per-account data. The first time anyone logs in after
// accounts were introduced, this creates one account from the legacy
// credentials and reattaches every pre-existing (accountless) Person to it,
// so existing data isn't orphaned by the migration to multi-tenant.
export async function ensureLegacyAccount() {
  const existing = await prisma.account.count();
  if (existing > 0) {
    return;
  }

  const email = process.env.LEGACY_ACCOUNT_EMAIL?.trim().toLowerCase();
  const password = process.env.LEGACY_ACCOUNT_PASSWORD || process.env.APP_PASSWORD;
  if (!email || !password) {
    return;
  }

  const account = await prisma.account.create({
    data: { email, passwordHash: hashPassword(password) },
  });
  await prisma.person.updateMany({
    where: { accountId: null },
    data: { accountId: account.id },
  });
}
