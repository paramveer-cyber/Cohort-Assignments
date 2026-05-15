import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { pollRoutes } from "./modules/poll/poll.routes.js";
import { errorHandler } from "./common/middleware/errorHandler.js";
import ApiError from "./common/utils/api-error.js";

const CORS_CONFIG = {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(CORS_CONFIG));
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());

app.get("/health", (_req, res) =>
    res.status(200).json({ status: "ok" })
);

app.use("/auth", authRoutes);
app.use("/polls", pollRoutes);

app.use((_req, _res, next) => next(ApiError.notFound("Route not found")));
app.use(errorHandler);

export { app, CORS_CONFIG };