import { z } from "zod";

const USER_ROLES = ["seeker", "employer", "admin"];
const USER_STATUSES = ["active", "disabled"];
const USER_SORT_FIELDS = ["name", "email", "role", "status"];

const emptyStringToUndefined = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
};

const optionalTrimmedString = (schema) =>
    z.preprocess(emptyStringToUndefined, schema.optional());

export const listUsersQuerySchema = z.object({
    search: optionalTrimmedString(
        z.string().max(128, "Search must be at most 128 characters")
    ),
    role: optionalTrimmedString(
        z.enum(USER_ROLES, { error: "Role must be seeker, employer, or admin" })
    ),
    status: optionalTrimmedString(
        z.enum(USER_STATUSES, { error: "Status must be active or disabled" })
    ),
    sortBy: optionalTrimmedString(
        z.enum(USER_SORT_FIELDS, {
            error: "Sort field must be name, email, role, or status",
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

export const updateUserStatusSchema = z.object({
    status: z.enum(USER_STATUSES, {
        error: "Status must be active or disabled",
    }),
}).strict();
