import { Router } from "express";
import {
    handleSignUp, handleLogin, handleRefresh, handleLogout,
    handleGetMe, handleUpdateMe, handleChangePassword,
} from "./auth.controllers.js";
import { validateSignUp, validateLogin, requireRefreshCookie } from "./auth.middleware.js";
import { rateLimit } from "../../common/middleware/rateLimit.js";
import verifyJWT from "../../common/middleware/verifyJWT.js";

const authRoutes = Router();

authRoutes.post("/signup", rateLimit({ windowMs: 60_000, max: 5 }), validateSignUp, handleSignUp);
authRoutes.post("/login", rateLimit({ windowMs: 60_000, max: 10 }), validateLogin, handleLogin);
authRoutes.post("/refresh", rateLimit({ windowMs: 60_000, max: 30 }), requireRefreshCookie, handleRefresh);
authRoutes.post("/logout", handleLogout);

authRoutes.get("/me", verifyJWT, handleGetMe);
authRoutes.patch("/me", verifyJWT, handleUpdateMe);
authRoutes.post("/change-password", verifyJWT, rateLimit({ windowMs: 60_000, max: 5 }), handleChangePassword);

export default authRoutes;