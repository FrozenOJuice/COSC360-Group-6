import { appError } from "../utils/appError.js";
import { broadcastDiscussion } from "../utils/discussionEventBus.js";
import { findJobById } from "../repositories/jobRepository.js";
import {
    findDiscussionByJobId,
    addCommentToDiscussion,
    createDiscussionForJob,
} from "../repositories/jobDiscussionRepository.js";

function mapComments(comments = []) {
    return comments.map((comment) => ({
        id: comment.id ?? String(comment._id),
        userId: comment.userId ? String(comment.userId._id || comment.userId) : null,
        userName: comment.userId?.name || "Anonymous",
        comment: comment.comment,
        createdAt: comment.createdAt ? comment.createdAt.toISOString() : null,
        updatedAt: comment.updatedAt ? comment.updatedAt.toISOString() : null,
    }));
}

export async function getJobDiscussion(jobId) {
    if (!jobId) {
        throw appError("INVALID_REQUEST", "Job id is required");
    }

    const job = await findJobById(jobId);
    if (!job) {
        throw appError("NOT_FOUND", "Job not found");
    }

    let discussion = await findDiscussionByJobId(jobId);
    if (!discussion) {
        discussion = await createDiscussionForJob(jobId);
    }

    await discussion.populate({ path: "comments.userId", select: "name" });

    return {
        discussion: {
            jobId: String(discussion.jobId),
            comments: mapComments(discussion.comments),
        },
    };
}

export async function addJobComment(jobId, userId, text) {
    if (!jobId || !userId) {
        throw appError("INVALID_REQUEST", "Job id and user id are required");
    }

    if (typeof text !== "string" || !text.trim()) {
        throw appError("INVALID_REQUEST", "Comment is required");
    }

    const job = await findJobById(jobId);
    if (!job) {
        throw appError("NOT_FOUND", "Job not found");
    }

    const discussion = await addCommentToDiscussion(jobId, {
        userId,
        comment: text.trim(),
    });

    await discussion.populate({ path: "comments.userId", select: "name" });

    const result = {
        jobId: String(discussion.jobId),
        comments: mapComments(discussion.comments),
    };
    broadcastDiscussion(jobId, result);
    return { discussion: result };
}

export async function updateJobComment(jobId, commentId, userId, role, text) {
    if (!jobId || !commentId || !userId) {
        throw appError("INVALID_REQUEST", "Job id, comment id and user id are required");
    }

    if (typeof text !== "string" || !text.trim()) {
        throw appError("INVALID_REQUEST", "Comment is required");
    }

    const job = await findJobById(jobId);
    if (!job) {
        throw appError("NOT_FOUND", "Job not found");
    }

    const discussion = await findDiscussionByJobId(jobId);
    if (!discussion) {
        throw appError("NOT_FOUND", "Discussion not found");
    }

    const comment = discussion.comments.id(commentId);
    if (!comment) {
        throw appError("NOT_FOUND", "Comment not found");
    }

    if (String(comment.userId) !== String(userId) && role !== "admin") {
        throw appError("FORBIDDEN", "You are not allowed to edit this comment");
    }

    comment.comment = text.trim();
    await discussion.save();

    await discussion.populate({ path: "comments.userId", select: "name" });

    const result = {
        jobId: String(discussion.jobId),
        comments: mapComments(discussion.comments),
    };
    broadcastDiscussion(jobId, result);
    return { discussion: result };
}

export async function deleteJobComment(jobId, commentId, userId, role) {
    if (!jobId || !commentId || !userId) {
        throw appError("INVALID_REQUEST", "Job id, comment id and user id are required");
    }

    const job = await findJobById(jobId);
    if (!job) {
        throw appError("NOT_FOUND", "Job not found");
    }

    const discussion = await findDiscussionByJobId(jobId);
    if (!discussion) {
        throw appError("NOT_FOUND", "Discussion not found");
    }
    
    const comment = discussion.comments.id(commentId);
    if (!comment) {
        throw appError("NOT_FOUND", "Comment not found");
    }

    if (String(comment.userId) !== String(userId) && role !== "admin") {
        throw appError("FORBIDDEN", "You are not allowed to delete this comment");
    }

    discussion.comments.pull(commentId);

    try {
        await discussion.save();
    } catch (saveErr) {
        console.error("Failed saving discussion after comment deletion", saveErr);
        throw saveErr;
    }


    await discussion.populate({ path: "comments.userId", select: "name" });

    const result = {
        jobId: String(discussion.jobId),
        comments: mapComments(discussion.comments),
    };
    broadcastDiscussion(jobId, result);
    return { discussion: result };
}
