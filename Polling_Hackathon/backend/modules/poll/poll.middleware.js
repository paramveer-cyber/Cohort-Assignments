import { findPollById } from "./poll.queries.js";
import ApiError from "../../common/utils/api-error.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";

export const pollOwner = asyncHandler(async (req, _res, next) => {
    const poll = await findPollById(req.params.id);
    if (!poll) throw ApiError.notFound("Poll not found");
    if (poll.creatorId !== req.user.userId) throw ApiError.forbidden("Not your poll");
    req.poll = poll;
    return next();
});
