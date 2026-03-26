import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 2000,
        },
    },
    {
        timestamps: true,
    }
);

const jobDiscussionSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
            unique: true,
            index: true,
        },
        comments: {
            type: [commentSchema],
            default: [],
        },
    },
    {
        collection: "jobDiscussions",
        timestamps: true,
    }
);

const JobDiscussion = mongoose.models.JobDiscussion || mongoose.model("JobDiscussion", jobDiscussionSchema);
export default JobDiscussion;
