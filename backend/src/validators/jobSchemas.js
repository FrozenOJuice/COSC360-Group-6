import { z } from "zod";
import {
    buildObjectIdSchema,
    createLimitQuerySchema,
    createPageQuerySchema,
    optionalTrimmedString,
} from "./schemaUtils.js";

const JOB_SORT_FIELDS = ["title", "category", "country", "salary", "currency"];
const requiredString = (fieldName) => z.string({
    error: `${fieldName} is required`,
}).trim().min(1, `${fieldName} is required`);
const numberField = (fieldName) => z.coerce.number({
    error: `${fieldName} is required`,
});

const createJobShape = {
    title: requiredString("Title")
        .min(2, "Title must be at least 2 characters")
        .max(120, "Title must be at most 120 characters"),
    category: requiredString("Category")
        .min(2, "Category must be at least 2 characters")
        .max(120, "Category must be at most 120 characters"),
    country: requiredString("Country")
        .min(2, "Country must be at least 2 characters")
        .max(80, "Country must be at most 80 characters"),
    salary: numberField("Salary")
        .min(0, "Salary must be at least 0"),
    currency: requiredString("Currency")
        .min(2, "Currency must be at least 2 characters")
        .max(10, "Currency must be at most 10 characters")
        .transform((value) => value.toUpperCase()),
};

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
            error: "Sort field must be title, category, country, salary, or currency",
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

export const createJobSchema = z.object(createJobShape).strict();

export const updateJobSchema = z.object({
    title: createJobShape.title.optional(),
    category: createJobShape.category.optional(),
    country: createJobShape.country.optional(),
    salary: createJobShape.salary.optional(),
    currency: createJobShape.currency.optional(),
}).strict().refine(
    (value) => Object.keys(value).length > 0,
    "At least one field is required"
);
