import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        employerUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
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
        applicantIds: [
            {
                type: mongoose.Schema.Types.ObjectId,   
                ref: "User",
            },
        ],

    },
    {
        collection: "jobs",
        timestamps: true,
    }
);

jobSchema.index(
    { title: "text", category: "text", country: "text" },
    {
        name: "job_text_search",
        weights: {
            title: 6,
            category: 3,
            country: 2,
        },
    }
);
jobSchema.index({ title: 1, _id: 1 }, { name: "job_title_sort" });
jobSchema.index({ category: 1, _id: 1 }, { name: "job_category_sort" });
jobSchema.index({ country: 1, _id: 1 }, { name: "job_country_sort" });
jobSchema.index({ salary: 1, _id: 1 }, { name: "job_salary_sort" });
jobSchema.index({ currency: 1, _id: 1 }, { name: "job_currency_sort" });
jobSchema.index({ employerUserId: 1, _id: 1 }, { name: "job_employer_sort" });

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default Job;
