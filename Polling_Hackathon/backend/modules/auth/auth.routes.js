import { Router } from "express";
import { register, login, googleAuth, refresh, getMe, logout, deleteAccount } from "./auth.controller.js";
import { authMiddleware } from "./auth.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import { authRateLimiter } from "../../common/middleware/rateLimiter.js";
import { RegisterSchema, LoginSchema, GoogleAuthSchema } from "./auth.schemas.js";

export const authRoutes = Router();

authRoutes.post("/register", authRateLimiter, validate(RegisterSchema),   register);
authRoutes.post("/login",    authRateLimiter, validate(LoginSchema),      login);
authRoutes.post("/google",   authRateLimiter, validate(GoogleAuthSchema), googleAuth);
authRoutes.post("/refresh",                                                refresh);
authRoutes.post("/logout",                                                 logout);
authRoutes.get("/me",        authMiddleware,                               getMe);
authRoutes.delete("/account", authMiddleware,                              deleteAccount);
