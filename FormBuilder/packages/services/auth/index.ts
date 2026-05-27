import { db } from "@repo/database";
import { usersTable } from "@repo/database/schema";
import { eq, and, lt } from "@repo/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { env } from "../env";
import { sendPasswordResetEmail, sendAccountDeletionEmail } from "../email";
import { isEmailEnabled } from "../user";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  type CookieResponse,
} from "../utils/cookies";

const googleClient = new OAuth2Client(env.GOOGLE_OAUTH_CLIENT_ID);

export function signAccessToken(userId: string) {
  return jwt.sign({ userId, type: "access" }, env.JWT_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ userId, type: "refresh" }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; type: string };
    if (payload.type !== "access") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; type: string };
    if (payload.type !== "refresh") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export function verifyToken(token: string): { userId: string } | null {
  return verifyAccessToken(token);
}

export function createTokenIssuer(res: CookieResponse) {
  return function issueTokens(userId: string): string {
    const accessToken = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId);
    setRefreshTokenCookie(res, refreshToken);
    return accessToken;
  };
}

export function createCookieClearer(res: CookieResponse) {
  return function clearTokenCookie(): void {
    clearRefreshTokenCookie(res);
  };
}

export async function registerUser(name: string, email: string, password: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) throw new Error("Email already registered");

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  const username =
    email
      .split("@")[0]!
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") + Math.floor(Math.random() * 1000);

  const [user] = await db
    .insert(usersTable)
    .values({ name, email, salt, passwordHash, username, emailVerified: false })
    .returning();

  return user!;
}

export async function loginUser(email: string, password: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !user.passwordHash) throw new Error("Invalid credentials");

  if (user.deletedAt) {
    await db
      .update(usersTable)
      .set({ deletedAt: null, deletionToken: null, deletionScheduledAt: null })
      .where(eq(usersTable.id, user.id));
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  await db.update(usersTable).set({ lastLoginAt: new Date() }).where(eq(usersTable.id, user.id));
  return user;
}

export async function findOrCreateGoogleUser(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_OAUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error("Invalid Google token");

  const { sub: googleId, email, name, picture } = payload;

  const byGoogle = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.googleId, googleId!))
    .limit(1);
  if (byGoogle.length > 0) {
    const existing = byGoogle[0]!;
    if (existing.deletedAt) throw new Error("ACCOUNT_SCHEDULED_FOR_DELETION");
    await db
      .update(usersTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(usersTable.id, existing.id));
    return existing;
  }

  const byEmail = await db.select().from(usersTable).where(eq(usersTable.email, email!)).limit(1);
  if (byEmail.length > 0) {
    const existing = byEmail[0]!;
    if (existing.deletedAt) throw new Error("ACCOUNT_SCHEDULED_FOR_DELETION");
    await db
      .update(usersTable)
      .set({ googleId: googleId!, lastLoginAt: new Date() })
      .where(eq(usersTable.id, existing.id));
    return existing;
  }

  const username =
    email!
      .split("@")[0]!
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") + Math.floor(Math.random() * 1000);

  const [user] = await db
    .insert(usersTable)
    .values({
      name: name ?? email!,
      email: email!,
      googleId: googleId!,
      avatarUrl: picture ?? null,
      username,
      emailVerified: true,
    })
    .returning();

  return user!;
}

export async function forgotPassword(email: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db
    .update(usersTable)
    .set({ passwordResetToken: resetToken, passwordResetExpiresAt: expiresAt })
    .where(eq(usersTable.id, user.id));

  const enabled = await isEmailEnabled(user.id, "password_reset");
  if (enabled) await sendPasswordResetEmail(user.email, resetToken);
}

export async function resetPassword(token: string, newPassword: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.passwordResetToken, token))
    .limit(1);

  if (!user || !user.passwordResetExpiresAt) throw new Error("Invalid or expired token");
  if (user.passwordResetExpiresAt < new Date()) throw new Error("Reset link has expired");

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await db
    .update(usersTable)
    .set({ salt, passwordHash, passwordResetToken: null, passwordResetExpiresAt: null })
    .where(eq(usersTable.id, user.id));
}

export async function softDeleteAccount(userId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) throw new Error("User not found");

  const deletionToken = crypto.randomBytes(32).toString("hex");
  const deletionScheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db
    .update(usersTable)
    .set({ deletedAt: new Date(), deletionToken, deletionScheduledAt })
    .where(eq(usersTable.id, userId));

  const enabled = await isEmailEnabled(userId, "account_deletion");
  if (enabled) await sendAccountDeletionEmail(user.email, user.name);
}

export async function purgeExpiredDeletedAccounts() {
  const expiredUsers = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(lt(usersTable.deletionScheduledAt, new Date())));

  for (const user of expiredUsers) {
    await db.delete(usersTable).where(eq(usersTable.id, user.id));
  }

  return expiredUsers.length;
}
