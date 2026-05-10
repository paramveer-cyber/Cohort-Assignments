import { Router } from "express";
import { handleSignUp, handleLogin, handleRefresh, handleLogout } from "./auth.controllers.js";
import { validateSignUp, validateLogin, requireRefreshCookie } from "./auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/signup", validateSignUp, handleSignUp);
authRoutes.post("/login", validateLogin, handleLogin);
authRoutes.post("/refresh", requireRefreshCookie, handleRefresh);
authRoutes.post("/logout", handleLogout);

export default authRoutes;
