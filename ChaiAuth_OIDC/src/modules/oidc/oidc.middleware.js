import ApiError from "../../common/utils/apiError.js";
import { checkIfClientExists, returnClient } from "../../common/db/db.js";
import { validatePkceParams } from "../../common/utils/pkce.js";

export async function validateAuthRequest(req, res, next) {
    try {
        const { clientId, redirect_uri, response_type } = req.query;

        if (!clientId)      return next(ApiError.badRequest("Missing clientId"));
        if (!redirect_uri)  return next(ApiError.badRequest("Missing redirect_uri"));
        if (response_type !== "code") return next(ApiError.badRequest("response_type must be 'code'"));

        const exists = await checkIfClientExists(clientId);
        if (!exists) return next(ApiError.notfound("Unknown client"));

        const client = await returnClient(clientId);
        if (!client.client_redirect_uris.includes(redirect_uri)) {
            return next(ApiError.badRequest("redirect_uri not registered"));
        }

        const { code_challenge, code_challenge_method } = req.query;

        if (client.pkce_required) {
            try {
                validatePkceParams({ codeChallenge: code_challenge, codeChallengeMethod: code_challenge_method });
            } catch (err) {
                return next(err);
            }
        } else if (code_challenge) {
            // PKCE optional but provided — validate it if present
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
