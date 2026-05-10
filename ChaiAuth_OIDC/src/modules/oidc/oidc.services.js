import crypto from "node:crypto";
import ApiError from "../../common/utils/apiError.js";
import { returnClient, insertAuthCode, consumeAuthCode, getUserById } from "../../common/db/db.js";
import { signOidcToken, generateRefreshToken } from "../../common/utils/jwt.utils.js";
import { verifyCodeVerifier } from "../../common/utils/pkce.js";

const ISSUER = process.env.ISSUER || "http://localhost:8080";
const ALLOWED_SCOPES = new Set(["openid", "profile", "email"]);

function parseScope(raw, clientAllowed) {
    const allowed = new Set(clientAllowed.split(" ").filter(s => ALLOWED_SCOPES.has(s)));
    const requested = (raw || "openid").split(" ").filter(s => allowed.has(s));
    if (!requested.includes("openid")) throw ApiError.badRequest("scope must include openid");
    return requested.join(" ");
}

export async function buildAuthRedirect({ clientId, redirectUri, scope, state, nonce, userId, codeChallenge, codeChallengeMethod }) {
    const client = await returnClient(clientId);

    if (!client.client_redirect_uris.includes(redirectUri)) {
        throw ApiError.badRequest("redirect_uri not registered");
    }

    if (client.pkce_required && !codeChallenge) {
        throw ApiError.badRequest("PKCE required for this client");
    }

    const parsedScope = parseScope(scope, client.allowed_scopes);
    const code = crypto.randomBytes(32).toString("hex");

    await insertAuthCode({
        code,
        clientId,
        userId,
        redirectUri,
        scope: parsedScope,
        nonce: nonce || null,
        state: state || null,
        codeChallenge: codeChallenge || null,
        codeChallengeMethod: codeChallengeMethod || null,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const url = new URL(redirectUri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);

    return url.toString();
}

export async function exchangeCodeForTokens({ code, clientId, clientSecret, redirectUri, codeVerifier }) {
    const client = await returnClient(clientId);

    if (client.client_type === "confidential") {
        if (!clientSecret || client.client_secret !== clientSecret) {
            throw ApiError.unauthorized("Invalid client credentials");
        }
    }

    const record = await consumeAuthCode(code);
    if (!record) throw ApiError.badRequest("Invalid, expired, or already-used authorization code");

    if (record.client_id !== clientId) throw ApiError.badRequest("client_id mismatch");
    if (record.redirect_uri !== redirectUri) throw ApiError.badRequest("redirect_uri mismatch");

    if (record.code_challenge) {
        verifyCodeVerifier({
            codeVerifier,
            codeChallenge: record.code_challenge,
            codeChallengeMethod: record.code_challenge_method,
        });
    } else if (client.pkce_required) {
        throw ApiError.badRequest("PKCE code_verifier required");
    }

    const user = await getUserById(record.user_id);
    if (!user) throw ApiError.notfound("User not found");

    const scopes = record.scope.split(" ");
    const now = Math.floor(Date.now() / 1000);

    const accessToken = signOidcToken(
        { sub: user.user_id, client_id: clientId, scope: record.scope, role: user.role },
        "15m"
    );

    const idPayload = {
        sub: user.user_id,
        aud: clientId,
        iss: ISSUER,
        iat: now,
        exp: now + 3600,
    };
    if (record.nonce) idPayload.nonce = record.nonce;
    if (scopes.includes("profile")) { idPayload.preferred_username = user.username; if (user.display_name) idPayload.name = user.display_name; if (user.avatar_url) idPayload.picture = user.avatar_url; if (user.organization) idPayload.organization = user.organization; }
    if (scopes.includes("email") && user.email) idPayload.email = user.email;

    const idToken = signOidcToken(idPayload);

    return {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 900,
        id_token: idToken,
        scope: record.scope,
    };
}
