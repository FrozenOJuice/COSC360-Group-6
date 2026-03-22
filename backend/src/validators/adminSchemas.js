import { z } from "zod";
import {
    buildObjectIdSchema,
    createLimitQuerySchema,
    createPageQuerySchema,
    optionalTrimmedString,
} from "./schemaUtils.js";

const USER_ROLES = ["seeker", "employer", "admin"];
const USER_STATUSES = ["active", "disabled"];
const USER_SORT_FIELDS = ["name", "email", "role", "status"];

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
    page: createPageQuerySchema(),
    limit: createLimitQuerySchema(),
}).strict();

export const updateUserStatusSchema = z.object({
    status: z.enum(USER_STATUSES, {
        error: "Status must be active or disabled",
    }),
}).strict();

export const updateUserStatusParamsSchema = z.object({
    id: buildObjectIdSchema("User id"),
}).strict();

export const adminUserParamsSchema = z.object({
    id: buildObjectIdSchema("User id"),
}).strict();
