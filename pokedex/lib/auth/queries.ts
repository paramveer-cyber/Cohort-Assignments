import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const findUserById = (id: string) =>
    db.query.users.findFirst({ where: eq(users.id, id) });

export const findUserByEmail = (email: string) =>
    db.query.users.findFirst({ where: eq(users.email, email) });

export const findUserByRefreshToken = (token: string) =>
    db.query.users.findFirst({ where: eq(users.refreshToken, token) });

export const insertUser = async (data: {
    username: string;
    email: string;
    salt?: string;
    password?: string;
    provider: 'local' | 'google';
}) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
};

export const setUserRefreshToken = (id: string, token: string | null) =>
    db.update(users).set({ refreshToken: token }).where(eq(users.id, id));

export const deleteUserById = (id: string) =>
    db.delete(users).where(eq(users.id, id));

export const rotateRefreshToken = async (oldToken: string, newToken: string) => {
    const result = await db
        .update(users)
        .set({ refreshToken: newToken })
        .where(eq(users.refreshToken, oldToken))
        .returning({ id: users.id });
    return result.length === 1 ? result[0] : null;
};
