import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "ledger_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is not set");
  }
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token: string | undefined | null) {
  if (!token || !process.env.AUTH_SECRET) {
    return false;
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  if (!timingSafeEqual(left, right)) {
    return false;
  }
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function passwordsMatch(candidate: string) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    return false;
  }
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
