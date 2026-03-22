import {
    countJobs,
    findJobById,
    listDistinctJobFieldValues,
    listJobs,
} from "../repositories/jobRepository.js";
import { toJobDto } from "../dto/jobDto.js";
import { normalizeTextSearch, toPositiveInt } from "./queryUtils.js";
import { appError } from "../utils/appError.js";

const SORT_FIELDS = new Set(["title", "category", "country", "salary", "currency", "exchangeRate"]);

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

export async function listBoardJobs(options = {}) {
    const { filters, normalizedFilters } = buildJobFilters(options);
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

    return {
        jobs: jobs.map(toJobDto),
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
