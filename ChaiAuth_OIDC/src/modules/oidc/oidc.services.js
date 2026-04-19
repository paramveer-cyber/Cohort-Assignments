import crypto from "crypto";
import jwt from "jsonwebtoken";
import ApiError from "../../common/utils/apiError.js";
import {returnClient,insertAuthCode, consumeAuthCode, getUserById} from "../../common/db/db.js";
import { getPrivateKey, getKid } from "../../common/utils/keys.js";

const ISSUER = process.env.ISSUER || "http://localhost:8080";
const ALLOWED_SCOPES = new Set(["openid", "profile", "email"]);

function parseScope(raw) {
    const parts = (raw || "openid").split(" ").filter(s => ALLOWED_SCOPES.has(s));
    if (!parts.includes("openid")) throw ApiError.badRequest("scope must include openid");
    return parts.join(" ");
}

export async function buildAuthRedirect({ clientId, redirectUri, scope, state, nonce, userId }) {
    const client = await returnClient(clientId);

    const uris = client.client_redirect_uris;
    if (!uris.includes(redirectUri)) throw ApiError.badRequest("redirect_uri mismatch");

    const parsedScope = parseScope(scope);
    const code = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await insertAuthCode({
        code,
        clientId,
        userId,
        redirectUri,
        scope: parsedScope,
        nonce: nonce || null,
        state: state || null,
        expiresAt,
    });

    const url = new URL(redirectUri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);

    return url.toString();
}

export async function exchangeCodeForTokens({ code, clientId, clientSecret, redirectUri }) {
    const client = await returnClient(clientId);

    if (client.client_secret && client.client_secret !== clientSecret) {
        throw ApiError.unauthorized("Invalid client_secret");
    }

    const record = await consumeAuthCode(code);
    if (!record) throw ApiError.badRequest("Invalid, expired, or already-used code");

    if (record.client_id !== clientId) throw ApiError.badRequest("client_id mismatch");
    if (record.redirect_uri !== redirectUri) throw ApiError.badRequest("redirect_uri mismatch");

    const user = await getUserById(record.user_id);
    if (!user) throw ApiError.notfound("User not found");

    const scopes = record.scope.split(" ");

    const accessToken = jwt.sign(
        { sub: user.user_id, client_id: clientId, scope: record.scope },
        getPrivateKey(),
        { algorithm: "RS256", expiresIn: "15m", keyid: getKid(), issuer: ISSUER }
    );

    const idPayload = {
        sub: user.user_id,
        aud: clientId,
        iss: ISSUER,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
    };
    if (record.nonce) idPayload.nonce = record.nonce;
    if (scopes.includes("profile")) idPayload.preferred_username = user.username;
    if (scopes.includes("email"))   idPayload.email = user.username; 

    const idToken = jwt.sign(idPayload, getPrivateKey(), {
        algorithm: "RS256",
        keyid: getKid(),
    });

    return {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 900,
        id_token: idToken,
        scope: record.scope,
    };
}