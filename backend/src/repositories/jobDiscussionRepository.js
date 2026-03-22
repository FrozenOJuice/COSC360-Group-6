import JobDiscussion from "../models/JobDiscussion.js";

export async function findDiscussionByJobId(jobId) {
    if (!jobId) {
        return null;
    }

    return JobDiscussion.findOne({ jobId });
}

export async function createDiscussionForJob(jobId) {
    if (!jobId) {
        throw new Error("Job id is required");
    }

    const discussion = new JobDiscussion({ jobId, comments: [] });
    return discussion.save();
}

export async function addCommentToDiscussion(jobId, commentData) {
    if (!jobId) {
        throw new Error("Job id is required");
    }

    if (!commentData || !commentData.userId || !commentData.comment) {
        throw new Error("Comment data is required");
    }

    const discussion = await JobDiscussion.findOneAndUpdate(
        { jobId },
        {
            $setOnInsert: { jobId },
            $push: { comments: commentData },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return discussion;
}
