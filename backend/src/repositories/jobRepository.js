import Job from "../models/Job.js";

export async function findJobById(jobId) {
    return Job.findById(jobId).exec();
}

export async function listJobs(filters = {}, options = {}) {
    const query = Job.find(filters);

    if (options.sort) {
        query.sort(options.sort);
    }

    if (typeof options.skip === "number" && options.skip > 0) {
        query.skip(options.skip);
    }

    if (typeof options.limit === "number" && options.limit > 0) {
        query.limit(options.limit);
    }

    return query.exec();
}

export async function countJobs(filters = {}) {
    return Job.countDocuments(filters).exec();
}

export async function listDistinctJobFieldValues(fieldName) {
    return Job.distinct(fieldName, {
        [fieldName]: {
            $nin: [null, ""],
        },
    }).exec();
}

export async function createJob(jobData) {
    return Job.create(jobData);
}

export async function saveJob(job) {
    return job.save();
}
