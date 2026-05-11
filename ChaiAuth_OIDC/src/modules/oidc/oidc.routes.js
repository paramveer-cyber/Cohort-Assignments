import { Router } from "express";
import path from "path";
import fs from "fs";
import { handleDiscovery, handleJwks, handleLoginSubmit, handleTokenExchange } from "./oidc.controllers.js";
import { validateAuthRequest, validateTokenRequest, escapeHtml } from "./oidc.middleware.js";
import { rateLimit } from "../../common/middleware/rateLimit.js";

const oidcRoutes = Router();

oidcRoutes.get("/.well-known/openid-configuration", handleDiscovery);
oidcRoutes.get("/open-certs", handleJwks);

oidcRoutes.get("/signin", validateAuthRequest, (req, res) => {
    const filePath = path.join(process.cwd(), "src", "views", "login.html");
    let html = fs.readFileSync(filePath, "utf-8");

    const { clientId, redirect_uri, scope, state, nonce, code_challenge, code_challenge_method } = req.query;

    html = html
        .replace(/\{\{client_name\}\}/g, escapeHtml(req.oidcClient.client_name))
        .replace(/\{\{clientId\}\}/g, escapeHtml(clientId || ""))
        .replace(/\{\{redirect_uri\}\}/g, escapeHtml(redirect_uri || ""))
        .replace(/\{\{scope\}\}/g, escapeHtml(scope || "openid"))
        .replace(/\{\{state\}\}/g, escapeHtml(state || ""))
        .replace(/\{\{nonce\}\}/g, escapeHtml(nonce || ""))
        .replace(/\{\{code_challenge\}\}/g, escapeHtml(code_challenge || ""))
        .replace(/\{\{code_challenge_method\}\}/g, escapeHtml(code_challenge_method || ""));

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; frame-ancestors 'none'"
    );
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(html);
});

oidcRoutes.post("/signin", rateLimit({ windowMs: 60_000, max: 10 }), handleLoginSubmit);
oidcRoutes.post("/token", rateLimit({ windowMs: 60_000, max: 30 }), validateTokenRequest, handleTokenExchange);

export default oidcRoutes;
