import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { ok, created } from "../../common/utils/response.js";
import {
    createPoll, activatePoll, publishPoll, updatePoll, deletePoll,
    getPublicPoll, getCreatorPolls, getPollById, getCreatorAnalytics, getPublishedAnalytics,
    submitResponse, listPublished, getSubmissionStatus,
} from "./poll.services.js";

export const listPublicPolls = asyncHandler(async (_req, res) => {
    const polls = await listPublished();
    return ok(res, "Polls fetched", { polls });
});

export const getPollBySlug = asyncHandler(async (req, res) => {
    const poll = await getPublicPoll(req.params.slug);
    return ok(res, "Poll fetched", { poll });
});

export const handleGetSubmission = asyncHandler(async (req, res) => {
    const userId = req.user?.userId ?? null;
    const result = await getSubmissionStatus(req.params.slug, userId);
    return ok(res, "Submission status fetched", result);
});

export const handleSubmitResponse = asyncHandler(async (req, res) => {
    const { slug }  = req.params;
    const userId    = req.user?.userId ?? null;
    const answers   = req.body.answers;

    const response = await submitResponse({ slug, userId, answers });
    return created(res, "Response submitted successfully", { responseId: response.id });
});

export const handleCreatePoll = asyncHandler(async (req, res) => {
    const poll = await createPoll({ creatorId: req.user.userId, ...req.body });
    return created(res, "Poll created", { poll });
});

export const handleUpdatePoll = asyncHandler(async (req, res) => {
    const poll = await updatePoll(req.params.id, req.user.userId, req.body);
    return ok(res, "Poll updated", { poll });
});

export const handleActivatePoll = asyncHandler(async (req, res) => {
    const poll = await activatePoll(req.params.id, req.user.userId);
    return ok(res, "Poll activated", { poll });
});

export const handlePublishPoll = asyncHandler(async (req, res) => {
    const poll = await publishPoll(req.params.id, req.user.userId);
    return ok(res, "Poll published", { poll });
});

export const handleDeletePoll = asyncHandler(async (req, res) => {
    await deletePoll(req.params.id, req.user.userId);
    return ok(res, "Poll deleted");
});

export const handleGetPollById = asyncHandler(async (req, res) => {
    const poll = await getPollById(req.params.id, req.user.userId);
    return ok(res, "Poll fetched", { poll });
});

export const handleGetMyPolls = asyncHandler(async (req, res) => {
    const polls = await getCreatorPolls(req.user.userId);
    return ok(res, "Polls fetched", { polls });
});

export const handleGetAnalytics = asyncHandler(async (req, res) => {
    const analytics = await getCreatorAnalytics(req.params.id, req.user.userId);
    return ok(res, "Analytics fetched", { analytics });
});

export const handleGetPublishedAnalytics = asyncHandler(async (req, res) => {
    const userId       = req.user?.userId ?? null;
    const sessionToken = req.query.sessionToken ?? null;
    const analytics    = await getPublishedAnalytics(req.params.id, userId, sessionToken);
    return ok(res, "Analytics fetched", { analytics });
});