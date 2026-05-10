import { Router } from "express";
import { z } from "zod";
import { insertClient, returnClient, db } from "../../common/db/db.js";
import { clients } from "../../common/db/schema.js";
import { verifyAdmin } from "../../common/middleware/verifyAdmin.js";
import ApiError from "../../common/utils/apiError.js";

const ALLOWED_SCOPES = new Set(["openid", "profile", "email"]);

const ClientSchema = z.object({
    client_name: z.string().min(1).max(100),
    client_type: z.enum(["confidential", "public"]),
    redirect_uris: z.array(z.string().url("Each redirect_uri must be a valid URL")).min(1).max(10),
    allowed_scopes: z.string()
        .optional()
        .transform(s => s ?? "openid profile email")
        .refine(s => s.split(" ").every(sc => ALLOWED_SCOPES.has(sc)), {
            message: `Allowed scopes: ${[...ALLOWED_SCOPES].join(", ")}`,
        }),
    client_secret: z.string().min(16).optional(),
    pkce_required: z.boolean().optional(),
});

function validateClient(req, res, next) {
    const result = ClientSchema.safeParse(req.body);
    if (!result.success) return next(ApiError.badRequest(result.error.issues[0].message));

    const { client_type, client_secret, pkce_required } = result.data;

    if (client_type === "confidential" && !client_secret) {
        return next(ApiError.badRequest("Confidential clients require a client_secret (min 16 chars)"));
    }
    if (client_type === "public" && client_secret) {
        return next(ApiError.badRequest("Public clients must not have a client_secret"));
    }

    req.validatedClient = result.data;
    next();
}

const clientsRoutes = Router();

clientsRoutes.post("/clients", verifyAdmin, validateClient, async (req, res, next) => {
    try {
        const { client_name, client_type, redirect_uris, client_secret, allowed_scopes, pkce_required } = req.validatedClient;

        const client = await insertClient({
            clientName: client_name,
            clientSecret: client_secret,
            clientType: client_type,
            redirectUris: redirect_uris,
            allowedScopes: allowed_scopes,
            pkceRequired: pkce_required ?? (client_type === "public"),
        });

        res.status(201).json({ success: true, data: client });
    } catch (err) {
        next(err);
    }
});

clientsRoutes.get("/clients/:id", verifyAdmin, async (req, res, next) => {
    try {
        const client = await returnClient(req.params.id);
        const { client_secret, ...safe } = client;
        res.json({ success: true, data: safe });
    } catch (err) {
        next(err);
    }
});

clientsRoutes.get("/clients", verifyAdmin, async (req, res, next) => {
    try {
        const all = await db.select({
            client_id: clients.client_id,
            client_name: clients.client_name,
            client_type: clients.client_type,
            client_redirect_uris: clients.client_redirect_uris,
            allowed_scopes: clients.allowed_scopes,
            pkce_required: clients.pkce_required,
            created_at: clients.created_at,
        }).from(clients);
        res.json({ success: true, data: all });
    } catch (err) {
        next(err);
    }
});

export default clientsRoutes;
