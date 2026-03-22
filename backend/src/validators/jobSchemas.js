import { z } from "zod";
import {
    buildObjectIdSchema,
    createLimitQuerySchema,
    createPageQuerySchema,
    optionalTrimmedString,
} from "./schemaUtils.js";

const JOB_SORT_FIELDS = ["title", "category", "country", "salary", "currency", "exchangeRate"];

export const listJobsQuerySchema = z.object({
    search: optionalTrimmedString(
        z.string().max(128, "Search must be at most 128 characters")
    ),
    category: optionalTrimmedString(
        z.string().max(120, "Category must be at most 120 characters")
    ),
    country: optionalTrimmedString(
        z.string().max(80, "Country must be at most 80 characters")
    ),
    currency: optionalTrimmedString(
        z.string().min(2, "Currency must be at least 2 characters").max(10, "Currency must be at most 10 characters")
    ),
    sortBy: optionalTrimmedString(
        z.enum(JOB_SORT_FIELDS, {
            error: "Sort field must be title, category, country, salary, currency, or exchangeRate",
        })
    ),
    sortOrder: optionalTrimmedString(
        z.enum(["asc", "desc"], { error: "Sort order must be asc or desc" })
    ),
    page: createPageQuerySchema(),
    limit: createLimitQuerySchema(),
}).strict();

export const jobParamsSchema = z.object({
    id: buildObjectIdSchema("Job id"),
}).strict();
