import { Router } from "express";
import {
    listPublicPolls, getPollBySlug, handleSubmitResponse,
    handleCreatePoll, handleUpdatePoll, handleActivatePoll,
    handlePublishPoll, handleDeletePoll, handleGetMyPolls, handleGetPollById,
    handleGetAnalytics, handleGetPublishedAnalytics, handleGetSubmission,
} from "./poll.controller.js";
import { authMiddleware, optionalAuth } from "../auth/auth.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import { submitRateLimiter, readRateLimiter, analyticsRateLimiter } from "../../common/middleware/rateLimiter.js";
import { CreatePollSchema, UpdatePollSchema, SubmitResponseSchema } from "./poll.schemas.js";

export const pollRoutes = Router();

pollRoutes.get("/me/polls", authMiddleware, handleGetMyPolls);
pollRoutes.get("/me/poll/:id", authMiddleware, handleGetPollById);

pollRoutes.get("/", readRateLimiter, listPublicPolls);
pollRoutes.get("/:slug", readRateLimiter, optionalAuth, getPollBySlug);
pollRoutes.get("/:slug/submission", readRateLimiter, optionalAuth, handleGetSubmission);

pollRoutes.post("/:slug/respond", submitRateLimiter, authMiddleware, validate(SubmitResponseSchema), handleSubmitResponse);

pollRoutes.post("/", authMiddleware, validate(CreatePollSchema), handleCreatePoll);
pollRoutes.put("/:id", authMiddleware, validate(UpdatePollSchema), handleUpdatePoll);
pollRoutes.patch("/:id/activate", authMiddleware, handleActivatePoll);
pollRoutes.patch("/:id/publish", authMiddleware, handlePublishPoll);
pollRoutes.delete("/:id", authMiddleware, handleDeletePoll);
pollRoutes.get("/:id/analytics", authMiddleware, analyticsRateLimiter, handleGetAnalytics);
pollRoutes.get("/:id/results", optionalAuth, analyticsRateLimiter, handleGetPublishedAnalytics);