import { Router } from "express";
import {
    handleDiscovery, handleJwks,
    handleLoginSubmit, handleTokenExchange
} from "./oidc.controllers.js";
import { validateAuthRequest, validateTokenRequest } from "./oidc.middleware.js";
import path from "path";
import fs from "fs";

const oidcRoutes = Router();

oidcRoutes.get("/.well-known/openid-configuration", handleDiscovery);
oidcRoutes.get("/open-certs", handleJwks);

oidcRoutes.get("/signin", validateAuthRequest, async (req, res) => {
    const filePath = path.join(process.cwd(), "src", "views", "login.html");
    let html = fs.readFileSync(filePath, "utf-8");
    const { clientId, redirect_uri, scope, state, nonce } = req.query;

    html = html.replace("{{client_name}}", req.oidcClient.client_name);

    html = html
        .replace("{{clientId}}", clientId || "")
        .replace("{{redirect_uri}}", redirect_uri || "")
        .replace("{{scope}}", scope || "openid")
        .replace("{{state}}", state || "")
        .replace("{{nonce}}", nonce || "");

    res.send(html);
});

oidcRoutes.post("/signin", handleLoginSubmit);
oidcRoutes.post("/token", validateTokenRequest, handleTokenExchange);

export default oidcRoutes;