import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { insertClient, returnClient, db } from "../../common/db/db.js";
import { clients } from "../../common/db/schema.js";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "../../common/middleware/verifyAdmin.js";
import ApiError from "../../common/utils/apiError.js";

const BCRYPT_ROUNDS = 12;
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

const ClientUpdateSchema = z.object({
    client_name: z.string().min(1).max(100).optional(),
    redirect_uris: z.array(z.string().url("Each redirect_uri must be a valid URL")).min(1).max(10).optional(),
    allowed_scopes: z.string()
        .optional()
        .refine(s => !s || s.split(" ").every(sc => ALLOWED_SCOPES.has(sc)), {
            message: `Allowed scopes: ${[...ALLOWED_SCOPES].join(", ")}`,
        }),
    pkce_required: z.boolean().optional(),
});

function validateClient(req, res, next) {
    const result = ClientSchema.safeParse(req.body);
    if (!result.success) return next(ApiError.badRequest(result.error.issues[0].message));
    const { client_type, client_secret } = result.data;
    if (client_type === "confidential" && !client_secret)
        return next(ApiError.badRequest("Confidential clients require a client_secret (min 16 chars)"));
    if (client_type === "public" && client_secret)
        return next(ApiError.badRequest("Public clients must not have a client_secret"));
    req.validatedClient = result.data;
    next();
}

const clientsRoutes = Router();

clientsRoutes.post("/clients", verifyAdmin, validateClient, async (req, res, next) => {
    try {
        const { client_name, client_type, redirect_uris, client_secret, allowed_scopes, pkce_required } = req.validatedClient;

        const secretHash = client_secret ? await bcrypt.hash(client_secret, BCRYPT_ROUNDS) : null;

        const client = await insertClient({
            clientName: client_name,
            clientSecret: secretHash,
            clientType: client_type,
            redirectUris: redirect_uris,
            allowedScopes: allowed_scopes,
            pkceRequired: pkce_required ?? (client_type === "public"),
        });

        const { client_secret: _hash, ...safeClient } = client;
        res.status(201).json({
            success: true,
            message: client_secret
                ? "Client created. Store the secret now — it will not be shown again."
                : "Client created.",
            data: { ...safeClient, ...(client_secret ? { client_secret } : {}) },
        });
    } catch (err) { next(err); }
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
    } catch (err) { next(err); }
});

clientsRoutes.get("/clients/:id", verifyAdmin, async (req, res, next) => {
    try {
        const client = await returnClient(req.params.id);
        const { client_secret, ...safe } = client;
        res.json({ success: true, data: safe });
    } catch (err) { next(err); }
});

clientsRoutes.patch("/clients/:id", verifyAdmin, async (req, res, next) => {
    try {
        const result = ClientUpdateSchema.safeParse(req.body);
        if (!result.success) return next(ApiError.badRequest(result.error.issues[0].message));
        await returnClient(req.params.id); // throws 404 if not found
        const { client_name, redirect_uris, allowed_scopes, pkce_required } = result.data;
        const updates = {};
        if (client_name    !== undefined) updates.client_name          = client_name;
        if (redirect_uris  !== undefined) updates.client_redirect_uris = redirect_uris;
        if (allowed_scopes !== undefined) updates.allowed_scopes        = allowed_scopes;
        if (pkce_required  !== undefined) updates.pkce_required         = pkce_required;
        if (!Object.keys(updates).length) return next(ApiError.badRequest("No valid fields to update"));
        const updated = await db.update(clients).set(updates).where(eq(clients.client_id, req.params.id)).returning();
        const { client_secret, ...safe } = updated[0];
        res.json({ success: true, data: safe });
    } catch (err) { next(err); }
});

clientsRoutes.delete("/clients/:id", verifyAdmin, async (req, res, next) => {
    try {
        await returnClient(req.params.id); // throws 404 if not found
        await db.delete(clients).where(eq(clients.client_id, req.params.id));
        res.json({ success: true, message: "Client deleted successfully" });
    } catch (err) { next(err); }
});

clientsRoutes.post("/clients/:id/secret", verifyAdmin, async (req, res, next) => {
    try {
        const client = await returnClient(req.params.id);
        if (client.client_type !== "confidential")
            return next(ApiError.badRequest("Only confidential clients have secrets"));
        const newSecret = crypto.randomBytes(32).toString("hex");
        const secretHash = await bcrypt.hash(newSecret, BCRYPT_ROUNDS);
        await db.update(clients).set({ client_secret: secretHash }).where(eq(clients.client_id, req.params.id));
        res.json({
            success: true,
            message: "Secret regenerated. Store it now — it will not be shown again.",
            data: { client_id: req.params.id, client_secret: newSecret },
        });
    } catch (err) { next(err); }
});

export default clientsRoutes;