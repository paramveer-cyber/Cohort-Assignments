import express from "express";
import cookieParser from "cookie-parser";
import { logger } from "@repo/logger";
import cors from "cors";
import rateLimit from "express-rate-limit";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";
import { env } from "./env";

export const app = express();

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "FormCraft API",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
  description: "Form builder SaaS API. Demo credentials: demo@formcraft.app / Demo1234!",
});

const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

app.use(cors({ origin: webUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const publicSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many submissions, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use("/api/public/forms/:slug/submit", publicSubmitLimiter);

app.get("/", (_req, res) => res.json({ message: "FormCraft API is running" }));
app.get("/health", (_req, res) => res.json({ message: "healthy", healthy: true }));

app.get("/openapi.json", (_req, res) => res.json(openApiDocument));

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use("/api", createOpenApiExpressMiddleware({ router: serverRouter, createContext }));
app.use("/trpc", trpcExpress.createExpressMiddleware({ router: serverRouter, createContext }));

export default app;
