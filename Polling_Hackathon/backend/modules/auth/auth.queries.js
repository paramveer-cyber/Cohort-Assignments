import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export const findUserById = (id) =>
    db.query.users.findFirst({ where: eq(users.id, id) });

export const findUserByEmail = (email) =>
    db.query.users.findFirst({ where: eq(users.email, email) });

export const findUserByGoogleId = (googleId) =>
    db.query.users.findFirst({ where: eq(users.providerId, googleId) });

export const findUserByRefreshToken = (token) =>
    db.query.users.findFirst({ where: eq(users.refreshToken, token) });

export const insertUser = async (data) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
};

export const setUserRefreshToken = (id, token) =>
    db.update(users).set({ refreshToken: token }).where(eq(users.id, id));

export const clearUserRefreshToken = (id) =>
    db.update(users).set({ refreshToken: null }).where(eq(users.id, id));

export const deleteUserById = (id) =>
    db.delete(users).where(eq(users.id, id));

export const rotateRefreshToken = async (oldToken, newToken) => {
    const result = await db
        .update(users)
        .set({ refreshToken: newToken })
        .where(eq(users.refreshToken, oldToken))
        .returning({ id: users.id });
    return result.length === 1 ? result[0] : null;
};