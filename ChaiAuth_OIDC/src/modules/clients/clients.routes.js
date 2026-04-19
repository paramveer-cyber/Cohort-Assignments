import { Router } from "express";
import { insertClient } from "../../common/db/db.js";
import { verifyAdmin } from "../../common/middleware/verifyAdmin.js";
import ApiError from "../../common/utils/apiError.js";

const clientsRoutes = Router();

clientsRoutes.post("/add-client", verifyAdmin, async (req, res, next) => {
    try {
        const { client_name, client_secret, client_type, redirect_uris } = req.body;

        if (!client_name) return next(ApiError.badRequest("Missing client_name"));
        if (!Array.isArray(redirect_uris) || !redirect_uris.length)
            return next(ApiError.badRequest("redirect_uris must be non-empty array"));
        if (!["confidential", "public"].includes(client_type))
            return next(ApiError.badRequest("client_type must be confidential or public"));

        const client = await insertClient({
            clientName: client_name,
            clientSecret: client_secret,
            clientType: client_type,
            redirectUris: redirect_uris,
        });

        res.status(201).json({ success: true, data: client });
    } catch (err) {
        next(err);
    }
});

export default clientsRoutes;