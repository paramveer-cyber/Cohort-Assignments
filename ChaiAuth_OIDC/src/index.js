import express from "express";
import cookieParser from "cookie-parser";
import oidcRoutes from "./modules/oidc/oidc.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import clientsRoutes from "./modules/clients/clients.routes.js";
import viewsRoutes from "./modules/views/views.routes.js";
import errorHandler from "./common/middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
});

app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));
app.use(cookieParser());

app.get("/health", (_, res) => res.status(200).end());

app.use(oidcRoutes);

app.use("/auth", authRoutes);

app.use(clientsRoutes);

app.use(viewsRoutes);

app.use((req, res) => {
    if (req.accepts("html")) {
        res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
    } else {
        res.status(404).json({ success: false, message: "Not found" });
    }
});

app.use(errorHandler);

export default app;
