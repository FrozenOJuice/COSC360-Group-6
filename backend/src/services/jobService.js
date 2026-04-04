import {
    createJob,
    deleteJobById,
    countJobs,
    findJobById,
    listDistinctJobFieldValues,
    listJobs,
    updateJobById,
} from "../repositories/jobRepository.js";
import { toJobDto } from "../dto/jobDto.js";
import { normalizeTextSearch, toPositiveInt } from "./queryUtils.js";
import { appError } from "../utils/appError.js";
import { broadcast } from "../utils/jobEventBus.js";

const SORT_FIELDS = new Set(["title", "category", "country", "salary", "currency"]);

function normalizeJobFilterOptions(options = {}) {
    return {
        search: normalizeTextSearch(options.search),
        category: typeof options.category === "string" ? options.category.trim() : "",
        country: typeof options.country === "string" ? options.country.trim() : "",
        currency: typeof options.currency === "string" ? options.currency.trim().toUpperCase() : "",
    };
}

function buildJobFilters(options = {}) {
    const filters = {};
    const { search, category, country, currency } = normalizeJobFilterOptions(options);

    if (search) {
        filters.$text = { $search: search };
    }

    if (category) {
        filters.category = category;
    }

    if (country) {
        filters.country = country;
    }

    if (currency) {
        filters.currency = currency;
    }

    return {
        filters,
        normalizedFilters: {
            search,
            category,
            country,
            currency,
        },
    };
}

function buildJobListResult(jobs, total, {
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
    includeEmployerUserId = false,
}) {
    return {
        jobs: jobs.map((job) => toJobDto(job, { includeEmployerUserId })),
        pagination: {
            page,
            limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
        sort: {
            by: sortBy,
            order: sortOrder,
        },
        filters,
    };
}

async function listJobsForFilters(filters, normalizedFilters, options = {}, dtoOptions = {}) {
    const { search, category, country, currency } = normalizedFilters;
    const page = toPositiveInt(options.page, 1);
    const limit = toPositiveInt(options.limit, 25);
    const sortBy = SORT_FIELDS.has(options.sortBy) ? options.sortBy : "title";
    const sortOrder = options.sortOrder === "desc" ? "desc" : "asc";
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;
    const sort = {
        [sortBy]: sortDirection,
        _id: sortDirection,
    };

    const [jobs, total] = await Promise.all([
        listJobs(filters, { sort, skip, limit }),
        countJobs(filters),
    ]);

    return buildJobListResult(jobs, total, {
        page,
        limit,
        sortBy,
        sortOrder,
        filters: {
            search,
            category,
            country,
            currency,
        },
        includeEmployerUserId: dtoOptions.includeEmployerUserId,
    });
}

function buildManagedJobPayload(payload = {}) {
    const nextPayload = {
        title: payload.title,
        category: payload.category,
        country: payload.country,
        salary: payload.salary,
        currency: payload.currency,
    };

    return Object.fromEntries(
        Object.entries(nextPayload).filter(([, value]) => value !== undefined)
    );
}

async function getManagedJob(jobId, employerUserId, role) {
    if (!jobId) {
        throw appError("INVALID_REQUEST", "Job id is required");
    }

    if (!employerUserId) {
        throw appError("UNAUTHORIZED", "Not authenticated");
    }

    const job = await findJobById(jobId);
    if (!job) {
        throw appError("NOT_FOUND", "Job not found");
    }

    if ((String(job.employerUserId) !== String(employerUserId)) && role !== "admin") {
        throw appError("ROLE_NOT_ALLOWED", "You do not have permission to manage this job");
    }

    return job;
}

export async function listBoardJobs(options = {}) {
    const { filters, normalizedFilters } = buildJobFilters(options);
    return listJobsForFilters(filters, normalizedFilters, options);
}

export async function getBoardJob(jobId) {
    if (!jobId) {
        throw appError("INVALID_REQUEST", "Job id is required");
    }

    const job = await findJobById(jobId);
    if (!job) {
        throw appError("NOT_FOUND", "Job not found");
    }

    return {
        job: toJobDto(job),
    };
}

function compareOptionValues(left, right) {
    return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function normalizeOptionValues(values, transform = (value) => value) {
    return values
        .filter((value) => typeof value === "string" && value.trim() !== "")
        .map((value) => transform(value.trim()))
        .sort(compareOptionValues);
}

export async function getBoardJobOptions() {
    const [categories, countries, currencies] = await Promise.all([
        listDistinctJobFieldValues("category"),
        listDistinctJobFieldValues("country"),
        listDistinctJobFieldValues("currency"),
    ]);

    return {
        categories: normalizeOptionValues(categories),
        countries: normalizeOptionValues(countries),
        currencies: normalizeOptionValues(currencies, (value) => value.toUpperCase()),
    };
}

export async function listEmployerJobs(employerUserId, options = {}) {
    if (!employerUserId) {
        throw appError("UNAUTHORIZED", "Not authenticated");
    }

    const { filters, normalizedFilters } = buildJobFilters(options);
    filters.employerUserId = employerUserId;

    return listJobsForFilters(filters, normalizedFilters, options, {
        includeEmployerUserId: true,
    });
}

export async function listAdminJobs(adminUserId, role, options = {}) {
    if (!adminUserId || role !== "admin") {
        throw appError("UNAUTHORIZED", "Not authenticated");
    }

    const { filters, normalizedFilters } = buildJobFilters(options);

    return listJobsForFilters(filters, normalizedFilters, options, {
        includeEmployerUserId: false,
    });
}

export async function createEmployerJob(employerUserId, payload = {}) {
    if (!employerUserId) {
        throw appError("UNAUTHORIZED", "Not authenticated");
    }

    const job = await createJob({
        employerUserId,
        ...buildManagedJobPayload(payload),
    });

    broadcast("job-created", toJobDto(job));
    return {
        job: toJobDto(job, { includeEmployerUserId: true }),
    };
}

export async function updateEmployerJob(employerUserId, role, jobId, payload = {}) {
    await getManagedJob(jobId, employerUserId, role);

    const job = await updateJobById(jobId, buildManagedJobPayload(payload));
    if (!job) {
        throw appError("NOT_FOUND", "Job not found");
    }

    broadcast("job-updated", toJobDto(job));
    return {
        job: toJobDto(job, { includeEmployerUserId: true }),
    };
}

export async function deleteEmployerJob(employerUserId, role, jobId) {
    await getManagedJob(jobId, employerUserId, role);

    const job = await deleteJobById(jobId);
    if (!job) {
        throw appError("NOT_FOUND", "Job not found");
    }

    broadcast("job-deleted", { id: toJobDto(job).id });
    return {
        deleted: true,
        job: toJobDto(job, { includeEmployerUserId: true }),
    };
}
