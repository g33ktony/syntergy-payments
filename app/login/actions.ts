"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  passwordsMatch,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");
  if (!passwordsMatch(password)) {
    return { error: "That password is not correct." };
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  redirect(next.startsWith("/") ? next : "/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
