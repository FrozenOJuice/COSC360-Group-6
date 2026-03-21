import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 120,
        },
        category: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 120,
        },
        country: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80,
        },
        salary: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            minlength: 2,
            maxlength: 10,
        },
        exchangeRate: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        collection: "jobs",
        timestamps: true,
    }
);

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default Job;
