import ApiError from "../../common/utils/apiError.js";
import { checkIfClientExists, returnClient } from "../../common/db/db.js";
import { validatePkceParams } from "../../common/utils/pkce.js";

export function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

export async function validateAuthRequest(req, res, next) {
    try {
        const { clientId, redirect_uri, response_type, state } = req.query;

        if (!clientId)      return next(ApiError.badRequest("Missing clientId"));
        if (!redirect_uri)  return next(ApiError.badRequest("Missing redirect_uri"));
        if (response_type !== "code") return next(ApiError.badRequest("response_type must be 'code'"));

        if (!state) return next(ApiError.badRequest("state parameter is required"));
        if (redirect_uri.includes("#")) return next(ApiError.badRequest("redirect_uri must not contain a fragment"));

        const exists = await checkIfClientExists(clientId);
        if (!exists) return next(ApiError.notfound("Unknown client"));

        const client = await returnClient(clientId);
        if (!client.client_redirect_uris.includes(redirect_uri)) {
            return next(ApiError.badRequest("redirect_uri not registered"));
        }

        const { code_challenge, code_challenge_method } = req.query;

        // Validate PKCE if required OR if optionally provided
        if (client.pkce_required || code_challenge) {
            try {
                validatePkceParams({ codeChallenge: code_challenge, codeChallengeMethod: code_challenge_method });
            } catch (err) {
                return next(err);
            }
        }

        req.oidcClient = client;
        next();
    } catch (err) {
        next(err);
    }
}

export function validateTokenRequest(req, res, next) {
    const { grant_type, code, redirect_uri, client_id } = req.body;

    if (grant_type !== "authorization_code") return next(ApiError.badRequest("grant_type must be 'authorization_code'"));
    if (!code)         return next(ApiError.badRequest("Missing code"));
    if (!redirect_uri) return next(ApiError.badRequest("Missing redirect_uri"));
    if (!client_id)    return next(ApiError.badRequest("Missing client_id"));

    next();
}
