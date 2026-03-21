import { z } from "zod";

const JOB_SORT_FIELDS = ["title", "category", "country", "salary", "currency", "exchangeRate"];
const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const emptyStringToUndefined = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
};

const optionalTrimmedString = (schema) =>
    z.preprocess(emptyStringToUndefined, schema.optional());

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
    page: z.coerce.number()
        .int("Page must be an integer")
        .min(1, "Page must be at least 1")
        .default(1),
    limit: z.coerce.number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit must be at most 100")
        .default(25),
}).strict();

export const jobParamsSchema = z.object({
    id: z.string()
        .trim()
        .regex(OBJECT_ID_PATTERN, "Job id must be a valid MongoDB ObjectId"),
}).strict();
