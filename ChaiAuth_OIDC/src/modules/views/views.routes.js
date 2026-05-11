import { Router } from "express";
import path from "path";
import fs from "fs";

const viewsRoutes = Router();
const VIEWS_DIR = path.join(process.cwd(), "src", "views");

function sendView(res, filename) {
    const filePath = path.join(VIEWS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        const notFound = path.join(VIEWS_DIR, "404.html");
        return res.status(404).sendFile(notFound);
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(filePath);
}

viewsRoutes.get("/", (req, res) => sendView(res, "index.html"));
viewsRoutes.get("/auth/login", (req, res) => sendView(res, "auth-login.html"));
viewsRoutes.get("/auth/register", (req, res) => {
    const next = req.query.next ? `?next=${encodeURIComponent(req.query.next)}` : "";
    res.redirect(`/auth/login${next}#register`);
});

viewsRoutes.get("/dashboard", (req, res) => sendView(res, "dashboard.html"));
viewsRoutes.get("/dashboard/profile", (req, res) => sendView(res, "profile.html"));
viewsRoutes.get("/dashboard/clients", (req, res) => sendView(res, "clients.html"));
viewsRoutes.get("/dashboard/clients/new", (req, res) => sendView(res, "clients-new.html"));

viewsRoutes.get("/dashboard/clients/:id", (req, res) => {
    const { id } = req.params;
    if (!id || id === "new") return res.redirect("/dashboard/clients/new");
    sendView(res, "clients-detail.html");
});

viewsRoutes.get("/403", (req, res) => {
    res.status(403);
    sendView(res, "403.html");
});
viewsRoutes.get("/404", (req, res) => {
    res.status(404);
    sendView(res, "404.html");
});

export default viewsRoutes;
