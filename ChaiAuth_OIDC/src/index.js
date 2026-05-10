import express from "express";
import cookieParser from "cookie-parser";
import oidcRoutes from "./modules/oidc/oidc.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import clientsRoutes from "./modules/clients/clients.routes.js";
import errorHandler from "./common/middleware/errorHandler.js";

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_, res) => res.status(200).end());

app.use(oidcRoutes);
app.use("/auth", authRoutes);
app.use(clientsRoutes);

app.use((_, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use(errorHandler);

export default app;
