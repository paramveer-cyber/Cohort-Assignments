import { Router } from "express";
import path from "path";
import fs from "fs";
import { handleDiscovery, handleJwks, handleLoginSubmit, handleTokenExchange } from "./oidc.controllers.js";
import { validateAuthRequest, validateTokenRequest } from "./oidc.middleware.js";

const oidcRoutes = Router();

oidcRoutes.get("/.well-known/openid-configuration", handleDiscovery);
oidcRoutes.get("/open-certs", handleJwks);

oidcRoutes.get("/signin", validateAuthRequest, (req, res) => {
    const filePath = path.join(process.cwd(), "src", "views", "login.html");
    let html = fs.readFileSync(filePath, "utf-8");

    const { clientId, redirect_uri, scope, state, nonce, code_challenge, code_challenge_method } = req.query;

    html = html
        .replace("{{client_name}}", req.oidcClient.client_name)
        .replace("{{clientId}}", clientId || "")
        .replace("{{redirect_uri}}", redirect_uri || "")
        .replace("{{scope}}", scope || "openid")
        .replace("{{state}}", state || "")
        .replace("{{nonce}}", nonce || "")
        .replace("{{code_challenge}}", code_challenge || "")
        .replace("{{code_challenge_method}}", code_challenge_method || "");

    res.send(html);
});

oidcRoutes.post("/signin", handleLoginSubmit);
oidcRoutes.post("/token", validateTokenRequest, handleTokenExchange);

export default oidcRoutes;
