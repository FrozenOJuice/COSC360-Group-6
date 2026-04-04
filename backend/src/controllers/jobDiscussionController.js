import { asyncHandler } from "../middleware/asyncHandler.js";
import { getJobDiscussion, addJobComment, updateJobComment, deleteJobComment } from "../services/jobDiscussionService.js";
import { addDiscussionClient, removeDiscussionClient } from "../utils/discussionEventBus.js";
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
    const result = await updateJobComment(req.params?.id, req.params?.commentId, req.auth?.userId, req.auth?.role, req.body?.comment);
    return sendSuccess(res, result);
});

export const deleteComment = asyncHandler(async (req, res) => {
    const result = await deleteJobComment(req.params?.id, req.params?.commentId, req.auth?.userId, req.auth?.role);
    return sendSuccess(res, result);
});

export function streamDiscussion(req, res) {
    const jobId = req.params?.id;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    addDiscussionClient(jobId, res);
    res.write("event: connected\ndata: {}\n\n");

    const heartbeat = setInterval(() => {
        res.write(":heartbeat\n\n");
    }, 30000);

    req.on("close", () => {
        clearInterval(heartbeat);
        removeDiscussionClient(jobId, res);
    });
}
