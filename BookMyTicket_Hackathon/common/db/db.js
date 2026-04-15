import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import "dotenv/config";
import ApiError from "../utils/apiError.js";
import { users } from "./schema.js";
import { eq } from "drizzle-orm";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0,
});

export const db = drizzle(pool);

export async function checkIfUserExists(username) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length > 0;
}

export async function insertUser(username, password) {
    try {
        const result = await db.insert(users).values({ username, password }).returning();
        return result[0];
    } catch (err) {
        if (err.code === "23505") {
            throw ApiError.conflict("Username already exists!");
        }
        throw err;
    }
}

export async function getUser(username) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
}

export async function updateRefreshToken(username, refreshToken) {
    const result = await db.update(users).set({ refresh_token: refreshToken }).where(eq(users.username, username));
    if (result.rowCount === 0) {
        throw ApiError.notfound("User not found!");
    }
    return true;
}

export default pool;