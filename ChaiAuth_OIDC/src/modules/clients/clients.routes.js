import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { insertClient, returnClient, getClientsByOwner, getAllUsers, updateUserRole, db } from "../../common/db/db.js";
import { clients } from "../../common/db/schema.js";
import { eq } from "drizzle-orm";
import { requireAdmin, requireDeveloper } from "../../common/middleware/authorize.js";
import ApiError from "../../common/utils/apiError.js";
import { Role, VALID_ROLES } from "../../common/constants/roles.js";

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

async function resolveClient(req, res, next) {
    try {
        const client = await returnClient(req.params.id);
        req.client = client;
        next();
    } catch (err) { next(err); }
}

function assertOwnership(req, res, next) {
    if (req.user.role === Role.ADMIN) return next();
    if (req.client.owner_id !== req.user.id) return next(ApiError.forbidden("You do not own this client"));
    next();
}

const clientsRoutes = Router();

clientsRoutes.post("/clients", requireDeveloper, validateClient, async (req, res, next) => {
    try {
        const { client_name, client_type, redirect_uris, client_secret, allowed_scopes, pkce_required } = req.validatedClient;
        const secretHash = client_secret ? await bcrypt.hash(client_secret, BCRYPT_ROUNDS) : null;

        const client = await insertClient({
            ownerId: req.user.id,
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

clientsRoutes.get("/clients", requireDeveloper, async (req, res, next) => {
    try {
        let list;
        if (req.user.role === Role.ADMIN) {
            list = await db.select({
                client_id: clients.client_id,
                owner_id: clients.owner_id,
                client_name: clients.client_name,
                client_type: clients.client_type,
                client_redirect_uris: clients.client_redirect_uris,
                allowed_scopes: clients.allowed_scopes,
                pkce_required: clients.pkce_required,
                created_at: clients.created_at,
            }).from(clients);
        } else {
            list = await getClientsByOwner(req.user.id);
        }
        res.json({ success: true, data: list });
    } catch (err) { next(err); }
});

clientsRoutes.get("/clients/:id", requireDeveloper, resolveClient, assertOwnership, async (req, res, next) => {
    try {
        const { client_secret, ...safe } = req.client;
        res.json({ success: true, data: safe });
    } catch (err) { next(err); }
});

clientsRoutes.patch("/clients/:id", requireDeveloper, resolveClient, assertOwnership, async (req, res, next) => {
    try {
        const result = ClientUpdateSchema.safeParse(req.body);
        if (!result.success) return next(ApiError.badRequest(result.error.issues[0].message));
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

clientsRoutes.delete("/clients/:id", requireDeveloper, resolveClient, assertOwnership, async (req, res, next) => {
    try {
        await db.delete(clients).where(eq(clients.client_id, req.params.id));
        res.json({ success: true, message: "Client deleted successfully" });
    } catch (err) { next(err); }
});

clientsRoutes.post("/clients/:id/secret", requireDeveloper, resolveClient, assertOwnership, async (req, res, next) => {
    try {
        if (req.client.client_type !== "confidential")
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

clientsRoutes.get("/admin/users", requireAdmin, async (req, res, next) => {
    try {
        const list = await getAllUsers();
        res.json({ success: true, data: list });
    } catch (err) { next(err); }
});

clientsRoutes.patch("/admin/users/:id/role", requireAdmin, async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!role || !VALID_ROLES.has(role)) {
            return next(ApiError.badRequest(`Invalid role. Must be one of: ${[...VALID_ROLES].join(", ")}`));
        }
        if (req.params.id === req.user.id) {
            return next(ApiError.badRequest("Admins cannot change their own role"));
        }
        await updateUserRole(req.params.id, role);
        res.json({ success: true, message: `Role updated to ${role}` });
    } catch (err) { next(err); }
});

clientsRoutes.delete("/admin/clients/:id", requireAdmin, async (req, res, next) => {
    try {
        await returnClient(req.params.id);
        await db.delete(clients).where(eq(clients.client_id, req.params.id));
        res.json({ success: true, message: "Client deleted by admin" });
    } catch (err) { next(err); }
});

export default clientsRoutes;
