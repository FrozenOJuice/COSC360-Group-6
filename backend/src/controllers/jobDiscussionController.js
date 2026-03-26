import { asyncHandler } from "../middleware/asyncHandler.js";
import { getJobDiscussion, addJobComment, updateJobComment, deleteJobComment } from "../services/jobDiscussionService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getDiscussion = asyncHandler(async (req, res) => {
    const result = await getJobDiscussion(req.params?.id);
    return sendSuccess(res, result);
});

export const addComment = asyncHandler(async (req, res) => {
    const result = await addJobComment(req.params?.id, req.auth?.userId, req.body?.comment);
    return sendSuccess(res, result, 201);
});

export const updateComment = asyncHandler(async (req, res) => {
    const result = await updateJobComment(req.params?.id, req.params?.commentId, req.auth?.userId, req.body?.comment);
    return sendSuccess(res, result);
});

export const deleteComment = asyncHandler(async (req, res) => {
    const result = await deleteJobComment(req.params?.id, req.params?.commentId, req.auth?.userId);
    return sendSuccess(res, result);
});
