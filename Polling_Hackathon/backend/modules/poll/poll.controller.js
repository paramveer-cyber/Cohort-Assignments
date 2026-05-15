import { ok, created } from "../../common/utils/response.js";
import {
    createPoll, activatePoll, publishPoll, updatePoll, deletePoll,
    getPublicPoll, getCreatorPolls, getPollById, getCreatorAnalytics, getPublishedAnalytics,
    submitResponse, listPublished, getSubmissionStatus,
} from "./poll.services.js";

export const listPublicPolls = async (_req, res, next) => {
    try {
        const polls = await listPublished();
        return ok(res, "Polls fetched", { polls });
    } catch (err) {
        next(err);
    }
};

export const getPollBySlug = async (req, res, next) => {
    try {
        const poll = await getPublicPoll(req.params.slug);
        return ok(res, "Poll fetched", { poll });
    } catch (err) {
        next(err);
    }
};

export const handleGetSubmission = async (req, res, next) => {
    try {
        const userId = req.user?.userId ?? null;
        const anonToken = req.cookies?.anonToken ?? null;
        const result = await getSubmissionStatus(req.params.slug, userId, anonToken); 
        return ok(res, "Submission status fetched", result);
    } catch (err) {
        next(err);
    }
};

export const handleSubmitResponse = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const userId = req.user?.userId ?? null;
        const answers = req.body.answers;
        const anonToken = req.cookies?.anonToken ?? null;

        const response = await submitResponse({ slug, userId, anonToken, answers });
        return created(res, "Response submitted successfully", { responseId: response.id });
    } catch (err) {
        next(err);
    }
};

export const handleCreatePoll = async (req, res, next) => {
    try {
        const poll = await createPoll({ creatorId: req.user.userId, ...req.body });
        return created(res, "Poll created", { poll });
    } catch (err) {
        next(err);
    }
};

export const handleUpdatePoll = async (req, res, next) => {
    try {
        const poll = await updatePoll(req.params.id, req.user.userId, req.body);
        return ok(res, "Poll updated", { poll });
    } catch (err) {
        next(err);
    }
};

export const handleActivatePoll = async (req, res, next) => {
    try {
        const poll = await activatePoll(req.params.id, req.user.userId);
        return ok(res, "Poll activated", { poll });
    } catch (err) {
        next(err);
    }
};

export const handlePublishPoll = async (req, res, next) => {
    try {
        const poll = await publishPoll(req.params.id, req.user.userId);
        return ok(res, "Poll published", { poll });
    } catch (err) {
        next(err);
    }
};

export const handleDeletePoll = async (req, res, next) => {
    try {
        await deletePoll(req.params.id, req.user.userId);
        return ok(res, "Poll deleted");
    } catch (err) {
        next(err);
    }
};

export const handleGetPollById = async (req, res, next) => {
    try {
        const poll = await getPollById(req.params.id, req.user.userId);
        return ok(res, "Poll fetched", { poll });
    } catch (err) {
        next(err);
    }
};

export const handleGetMyPolls = async (req, res, next) => {
    try {
        const polls = await getCreatorPolls(req.user.userId);
        return ok(res, "Polls fetched", { polls });
    } catch (err) {
        next(err);
    }
};

export const handleGetAnalytics = async (req, res, next) => {
    try {
        const analytics = await getCreatorAnalytics(req.params.id, req.user.userId);
        return ok(res, "Analytics fetched", { analytics });
    } catch (err) {
        next(err);
    }
};

export const handleGetPublishedAnalytics = async (req, res, next) => {
    try {
        const userId = req.user?.userId ?? null;
        const anonToken = req.cookies?.anonToken ?? null;
        const analytics = await getPublishedAnalytics(req.params.id, userId, anonToken);
        return ok(res, "Analytics fetched", { analytics });
    } catch (err) {
        next(err);
    }
};
