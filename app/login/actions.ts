"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { ensureLegacyAccount } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/get-dictionary";

export type LoginState = { error?: string };

function normalizeEmail(raw: FormDataEntryValue | null) {
  return String(raw || "").trim().toLowerCase();
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { t } = await getDictionary();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");

  await ensureLegacyAccount();

  const account = await prisma.account.findUnique({ where: { email } });
  if (!account || !verifyPassword(password, account.passwordHash)) {
    return { error: t.login.error };
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(account.id), sessionCookieOptions);
  redirect(next.startsWith("/") ? next : "/");
}

export async function signup(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { t } = await getDictionary();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: t.signup.emailInvalid };
  }
  if (password.length < 8) {
    return { error: t.signup.passwordTooShort };
  }

  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing) {
    return { error: t.signup.emailTaken };
  }

  const account = await prisma.account.create({
    data: { email, passwordHash: hashPassword(password) },
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(account.id), sessionCookieOptions);
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
