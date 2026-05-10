import { buildAuthRedirect, exchangeCodeForTokens } from "./oidc.services.js";
import { loginUser } from "../auth/auth.services.js";
import { buildJwk } from "../../cert/keys.js";
import ApiError from "../../common/utils/apiError.js";

const BASE = process.env.ISSUER || "http://localhost:8080";

export function handleDiscovery(req, res) {
    res.json({
        issuer: BASE,
        authorization_endpoint: `${BASE}/signin`,
        token_endpoint: `${BASE}/token`,
        jwks_uri: `${BASE}/open-certs`,
        response_types_supported: ["code"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
        scopes_supported: ["openid", "profile", "email"],
        token_endpoint_auth_methods_supported: ["client_secret_post", "none"],
        grant_types_supported: ["authorization_code"],
        code_challenge_methods_supported: ["S256"],
        claims_supported: ["sub", "iss", "aud", "iat", "exp", "nonce", "preferred_username", "email", "role"],
    });
}

export function handleJwks(req, res) {
    res.json({ keys: [buildJwk()] });
}

export async function handleLoginSubmit(req, res, next) {
    try {
        const { username, password, clientId, redirect_uri, scope, state, nonce, code_challenge, code_challenge_method } = req.body;

        if (!username || !password) return next(ApiError.badRequest("Missing credentials"));
        if (!clientId || !redirect_uri) return next(ApiError.badRequest("Missing OIDC params"));

        const { user } = await loginUser(username, password);

        const redirectUrl = await buildAuthRedirect({
            clientId,
            redirectUri: redirect_uri,
            scope,
            state,
            nonce,
            userId: user.user_id,
            codeChallenge: code_challenge || null,
            codeChallengeMethod: code_challenge_method || null,
        });

        res.status(200).json({ redirect: redirectUrl });
    } catch (err) {
        next(err);
    }
}

export async function handleTokenExchange(req, res, next) {
    try {
        const { code, redirect_uri, client_id, client_secret, code_verifier } = req.body;

        const tokens = await exchangeCodeForTokens({
            code,
            clientId: client_id,
            clientSecret: client_secret,
            redirectUri: redirect_uri,
            codeVerifier: code_verifier || null,
        });

        res.json(tokens);
    } catch (err) {
        next(err);
    }
}
