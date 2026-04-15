import express from "express"
import {handleLogin, handleSignUp, handleLogout, refreshTokens} from "./auth.controllers.js"
import { validateUserData, requireRefreshCookie } from "./auth.middleware.js";

const authRoutes = express.Router();

authRoutes.get("/health", (req, res)=>{res.status(200).send("OK");})
authRoutes.post("/signup", validateUserData,  handleSignUp)
authRoutes.post("/login",  validateUserData,  handleLogin);
authRoutes.post("/logout", requireRefreshCookie, handleLogout)
authRoutes.post("/refresh", requireRefreshCookie, refreshTokens)
authRoutes.use((req, res)=>res.redirect(301, "/"))

export default authRoutes;