import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import "dotenv/config";
import ApiError from "../utils/apiError.js";
import { users, clients, authCodes } from "./schema.js";
import { eq, and, gt } from "drizzle-orm";
import { Role } from "../constants/roles.js";

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

export async function checkIfEmailExists(email) {
    if (!email) return false;
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0;
}

export async function insertUser(username, password, role = Role.USER, profile = {}) {
    try {
        const { display_name, email, avatar_url, bio, organization } = profile;
        const result = await db.insert(users).values({
            username,
            password,
            role,
            display_name: display_name || null,
            email: email || null,
            avatar_url: avatar_url || null,
            bio: bio || null,
            organization: organization || null,
        }).returning();
        return result[0];
    } catch (err) {
        if (err.code === "23505") {
            if (err.constraint?.includes("email")) throw ApiError.conflict("Email already in use!");
            throw ApiError.conflict("Username already exists!");
        }
        throw err;
    }
}

export async function getUser(username) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
}

export async function getUserById(userId) {
    const result = await db.select().from(users).where(eq(users.user_id, userId)).limit(1);
    return result[0];
}

export async function updateRefreshToken(username, refreshToken) {
    const result = await db
        .update(users)
        .set({ refresh_token: refreshToken })
        .where(eq(users.username, username));
    if (result.rowCount === 0) throw ApiError.notfound("User not found!");
    return true;
}

export async function updateUserRole(userId, role) {
    const result = await db.update(users).set({ role }).where(eq(users.user_id, userId));
    if (result.rowCount === 0) throw ApiError.notfound("User not found!");
    return true;
}

export async function checkIfClientExists(clientId) {
    const result = await db.select().from(clients).where(eq(clients.client_id, clientId)).limit(1);
    return result.length > 0;
}

export async function returnClient(clientId) {
    const result = await db.select().from(clients).where(eq(clients.client_id, clientId)).limit(1);
    if (!result.length) throw ApiError.notfound("Client not found");
    return result[0];
}

export async function insertClient({ clientName, clientSecret, clientType, redirectUris, allowedScopes, pkceRequired }) {
    const result = await db.insert(clients).values({
        client_name: clientName,
        client_secret: clientSecret || null,
        client_type: clientType,
        client_redirect_uris: redirectUris,
        allowed_scopes: allowedScopes || "openid profile email",
        pkce_required: pkceRequired ?? (clientType === "public"),
    }).returning();
    return result[0];
}

export async function insertAuthCode({
    code, clientId, userId, redirectUri, scope, nonce, state,
    codeChallenge, codeChallengeMethod, expiresAt,
}) {
    await db.insert(authCodes).values({
        code,
        client_id: clientId,
        user_id: userId,
        redirect_uri: redirectUri,
        scope: scope || "openid",
        nonce: nonce || null,
        state: state || null,
        code_challenge: codeChallenge || null,
        code_challenge_method: codeChallengeMethod || null,
        used: false,
        expires_at: expiresAt,
    });
}

export async function consumeAuthCode(code) {
    const now = new Date();
    const result = await db
        .select()
        .from(authCodes)
        .where(and(eq(authCodes.code, code), eq(authCodes.used, false), gt(authCodes.expires_at, now)))
        .limit(1);

    if (!result.length) return null;
    await db.update(authCodes).set({ used: true }).where(eq(authCodes.code, code));
    return result[0];
}

export default pool;
