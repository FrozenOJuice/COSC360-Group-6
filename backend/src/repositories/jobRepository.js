import Job from "../models/Job.js";

export async function findJobById(jobId) {
    return Job.findById(jobId).lean().exec();
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

    return query.lean().exec();
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

export async function addApplicantToJob(jobId, userID) {
    const job = await Job.findById(jobId).exec();
    if (!job) {
        throw new Error("Job not found");
    }
    job.applicantIds.push(userID);
    return job.save();
}


export async function createJob(jobData) {
    return Job.create(jobData);
}

export async function updateJobById(jobId, updateData) {
    return Job.findByIdAndUpdate(jobId, updateData, {
        new: true,
        runValidators: true,
    }).exec();
}

export async function deleteJobById(jobId) {
    return Job.findByIdAndDelete(jobId).exec();
}
