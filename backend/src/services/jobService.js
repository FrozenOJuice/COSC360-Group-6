import {
    countJobs,
    findJobById,
    listDistinctJobFieldValues,
    listJobs,
} from "../repositories/jobRepository.js";
import { appError } from "../utils/appError.js";

const SORT_FIELDS = new Set(["title", "category", "country", "salary", "currency", "exchangeRate"]);

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toPositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeJob(job) {
    return {
        id: job.id ?? String(job._id),
        title: job.title,
        category: job.category,
        country: job.country,
        salary: job.salary,
        currency: job.currency,
        exchangeRate: job.exchangeRate,
    };
}

function buildJobFilters(options = {}) {
    const filters = {};
    const search = typeof options.search === "string" ? options.search.trim() : "";
    const category = typeof options.category === "string" ? options.category.trim() : "";
    const country = typeof options.country === "string" ? options.country.trim() : "";
    const currency = typeof options.currency === "string" ? options.currency.trim().toUpperCase() : "";

    if (search) {
        const pattern = new RegExp(escapeRegex(search), "i");
        filters.$or = [
            { title: pattern },
            { category: pattern },
            { country: pattern },
        ];
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

    return filters;
}

export async function listBoardJobs(options = {}) {
    const filters = buildJobFilters(options);
    const search = typeof options.search === "string" ? options.search.trim() : "";
    const category = typeof options.category === "string" ? options.category.trim() : "";
    const country = typeof options.country === "string" ? options.country.trim() : "";
    const currency = typeof options.currency === "string" ? options.currency.trim().toUpperCase() : "";
    const page = toPositiveInt(options.page, 1);
    const limit = toPositiveInt(options.limit, 25);
    const sortBy = SORT_FIELDS.has(options.sortBy) ? options.sortBy : "title";
    const sortOrder = options.sortOrder === "desc" ? "desc" : "asc";
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;
    const sort = {
        [sortBy]: sortDirection,
        _id: 1,
    };

    const [jobs, total] = await Promise.all([
        listJobs(filters, { sort, skip, limit }),
        countJobs(filters),
    ]);

    return {
        jobs: jobs.map(normalizeJob),
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
        filters: {
            search,
            category,
            country,
            currency,
        },
    };
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
        job: normalizeJob(job),
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
