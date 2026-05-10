import crypto from "node:crypto";
import ApiError from "./apiError.js";

const SUPPORTED_METHODS = new Set(["S256"]);

export function validatePkceParams({ codeChallenge, codeChallengeMethod }) {
    if (!codeChallenge) throw ApiError.badRequest("PKCE code_challenge is required");
    if (!codeChallengeMethod) throw ApiError.badRequest("PKCE code_challenge_method is required");
    if (!SUPPORTED_METHODS.has(codeChallengeMethod)) {
        throw ApiError.badRequest(`Unsupported code_challenge_method. Supported: ${[...SUPPORTED_METHODS].join(", ")}`);
    }
    if (!/^[A-Za-z0-9\-._~]{43,128}$/.test(codeChallenge)) {
        throw ApiError.badRequest("Invalid code_challenge format");
    }
}

export function verifyCodeVerifier({ codeVerifier, codeChallenge, codeChallengeMethod }) {
    if (!codeVerifier) throw ApiError.badRequest("PKCE code_verifier is required");

    if (!/^[A-Za-z0-9\-._~]{43,128}$/.test(codeVerifier)) {
        throw ApiError.badRequest("Invalid code_verifier format");
    }

    if (codeChallengeMethod === "S256") {
        const computed = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64url");

        if (!crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(codeChallenge))) {
            throw ApiError.unauthorized("PKCE verification failed");
        }
        return true;
    }

    throw ApiError.badRequest("Unsupported code_challenge_method");
}
