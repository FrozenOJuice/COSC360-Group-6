import {
    clearRefreshTokenHash,
    findById,
    listUsers,
    updateUserStatus,
} from "../repositories/userRepository.js";
import { appError } from "../utils/appError.js";

const USER_STATUSES = new Set(["active", "disabled"]);
const SORT_FIELDS = new Set(["name", "email", "role", "status"]);

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toPositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
    };
}

function buildUserFilters(options = {}) {
    const filters = {};
    const search = typeof options.search === "string" ? options.search.trim() : "";
    const role = typeof options.role === "string" ? options.role.trim() : "";
    const status = typeof options.status === "string" ? options.status.trim() : "";

    if (search) {
        const pattern = new RegExp(escapeRegex(search), "i");
        filters.$or = [
            { name: pattern },
            { email: pattern },
        ];
    }

    if (role) {
        filters.role = role;
    }

    if (status) {
        filters.status = status;
    }

    return filters;
}

function compareUsers(left, right, sortBy, sortDirection) {
    const leftValue = String(left[sortBy] || "");
    const rightValue = String(right[sortBy] || "");
    const comparison = leftValue.localeCompare(rightValue, undefined, {
        sensitivity: "base",
    });

    if (comparison !== 0) {
        return comparison * sortDirection;
    }

    return String(left.id).localeCompare(String(right.id));
}

export async function listAdminUsers(options = {}) {
    const filters = buildUserFilters(options);
    const page = toPositiveInt(options.page, 1);
    const limit = toPositiveInt(options.limit, 25);
    const sortBy = SORT_FIELDS.has(options.sortBy) ? options.sortBy : "name";
    const sortOrder = options.sortOrder === "desc" ? "desc" : "asc";
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    const users = await listUsers(filters);
    const sortedUsers = [...users].sort((left, right) =>
        compareUsers(left, right, sortBy, sortDirection)
    );

    const total = sortedUsers.length;
    const start = (page - 1) * limit;
    const pagedUsers = sortedUsers.slice(start, start + limit);

    return {
        users: pagedUsers.map(normalizeUser),
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
            search: typeof options.search === "string" ? options.search.trim() : "",
            role: typeof options.role === "string" ? options.role.trim() : "",
            status: typeof options.status === "string" ? options.status.trim() : "",
        },
    };
}

export async function setManagedUserStatus({ userId, status }) {
    const nextStatus = typeof status === "string" ? status.trim() : "";

    if (!userId) {
        throw appError("INVALID_REQUEST", "User id is required");
    }

    if (!USER_STATUSES.has(nextStatus)) {
        throw appError("INVALID_REQUEST", "A valid user status is required");
    }

    const user = await findById(userId);
    if (!user) {
        throw appError("USER_NOT_FOUND", "User not found");
    }

    if (user.role === "admin" && nextStatus === "disabled") {
        throw appError("INVALID_REQUEST", "Admin accounts cannot be disabled");
    }

    if (user.status === nextStatus) {
        if (nextStatus === "disabled") {
            await clearRefreshTokenHash(user.id);
        }

        return { user: normalizeUser(user) };
    }

    const updatedUser = await updateUserStatus(user.id, nextStatus);
    if (!updatedUser) {
        throw appError("USER_NOT_FOUND", "User not found");
    }

    if (nextStatus === "disabled") {
        await clearRefreshTokenHash(updatedUser.id);
    }

    return {
        user: normalizeUser(updatedUser),
    };
}
