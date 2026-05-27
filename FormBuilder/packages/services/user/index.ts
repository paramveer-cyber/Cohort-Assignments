import { db } from "@repo/database";
import { usersTable } from "@repo/database/schema";
import { eq, desc } from "@repo/database";

export const EMAIL_TYPES = ["new_response", "password_reset", "account_deletion"] as const;
export type EmailType = (typeof EMAIL_TYPES)[number];

export async function getUserById(id: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  return user ?? null;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  return user ?? null;
}

export async function getEmailPreferences(userId: string): Promise<Record<EmailType, boolean>> {
  const user = await getUserById(userId);
  const stored = (user?.emailPreferences ?? {}) as Record<string, boolean>;
  return {
    new_response: stored["new_response"] !== false,
    password_reset: stored["password_reset"] !== false,
    account_deletion: stored["account_deletion"] !== false,
  };
}

export async function updateEmailPreferences(
  userId: string,
  prefs: Partial<Record<EmailType, boolean>>,
) {
  const current = await getEmailPreferences(userId);
  const merged = { ...current, ...prefs };
  await db.update(usersTable).set({ emailPreferences: merged }).where(eq(usersTable.id, userId));
  return merged;
}

export async function isEmailEnabled(userId: string, type: EmailType): Promise<boolean> {
  const user = await getUserById(userId);
  const stored = (user?.emailPreferences ?? {}) as Record<string, boolean>;
  return stored[type] !== false;
}

export async function adminListUsers() {
  return db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
      deletedAt: usersTable.deletedAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
}

export async function adminDeleteUser(userId: string) {
  await db.delete(usersTable).where(eq(usersTable.id, userId));
}
