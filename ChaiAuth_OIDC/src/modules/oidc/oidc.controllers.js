import { buildAuthRedirect, exchangeCodeForTokens } from "./oidc.services.js";
import { loginUser } from "../auth/auth.services.js";
import ApiError from "../../common/utils/apiError.js";
import { buildJwk } from "../../common/utils/keys.js";

export function handleDiscovery(req, res) {
    const base = process.env.ISSUER || "http://localhost:8080";
    res.json({
        issuer: base,
        authorization_endpoint: `${base}/signin`,
        token_endpoint: `${base}/token`,
        jwks_uri: `${base}/open-certs`,
        response_types_supported: ["code"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
        scopes_supported: ["openid", "profile", "email"],
        token_endpoint_auth_methods_supported: ["client_secret_post"],
        grant_types_supported: ["authorization_code"],
        claims_supported: ["sub", "iss", "aud", "iat", "exp", "nonce", "preferred_username", "email"],
    });
}

export function handleJwks(req, res) {
    res.json({ keys: [buildJwk()] });
}

export async function handleLoginSubmit(req, res, next) {
    try {
        const { username, password, clientId, redirect_uri, scope, state, nonce } = req.body;

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
        });

        res.status(200).json({ redirect: redirectUrl });
    } catch (err) {
        next(err);
    }
}

export async function handleTokenExchange(req, res, next) {
    try {
        const { code, redirect_uri, client_id, client_secret } = req.body;

        const tokens = await exchangeCodeForTokens({
            code,
            clientId: client_id,
            clientSecret: client_secret,
            redirectUri: redirect_uri,
        });

        res.json(tokens);
    } catch (err) {
        next(err);
    }
}