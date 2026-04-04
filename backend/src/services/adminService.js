import {
    countUsers,
    clearRefreshTokenHash,
    findById,
    listUsers,
    updateUserStatus,
} from "../repositories/userRepository.js";
import { toUserDto } from "../dto/userDto.js";
import { normalizeTextSearch, toPositiveInt } from "./queryUtils.js";
import { appError } from "../utils/appError.js";
import { broadcastAdminUsers } from "../utils/adminEventBus.js";
import { broadcastUserStatus } from "../utils/userEventBus.js";

const USER_STATUSES = new Set(["active", "disabled"]);
const SORT_FIELDS = new Set(["name", "email", "role", "status"]);

function normalizeUserFilterOptions(options = {}) {
    return {
        search: normalizeTextSearch(options.search),
        role: typeof options.role === "string" ? options.role.trim() : "",
        status: typeof options.status === "string" ? options.status.trim() : "",
    };
}

function buildUserFilters(options = {}) {
    const filters = {};
    const { search, role, status } = normalizeUserFilterOptions(options);

    if (search) {
        filters.$text = { $search: search };
    }

    if (role) {
        filters.role = role;
    }

    if (status) {
        filters.status = status;
    }

    return {
        filters,
        normalizedFilters: {
            search,
            role,
            status,
        },
    };
}

export async function listAdminUsers(options = {}) {
    const { filters, normalizedFilters } = buildUserFilters(options);
    const { search, role, status } = normalizedFilters;
    const page = toPositiveInt(options.page, 1);
    const limit = toPositiveInt(options.limit, 25);
    const sortBy = SORT_FIELDS.has(options.sortBy) ? options.sortBy : "name";
    const sortOrder = options.sortOrder === "desc" ? "desc" : "asc";
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    const start = (page - 1) * limit;
    const sort = {
        [sortBy]: sortDirection,
        _id: sortDirection,
    };
    const [users, total] = await Promise.all([
        listUsers(filters, { sort, skip: start, limit }),
        countUsers(filters),
    ]);

    return {
        users: users.map(toUserDto),
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
            role,
            status,
        },
    };
}

export async function getManagedUser(userId) {
    if (!userId) {
        throw appError("INVALID_REQUEST", "User id is required");
    }

    const user = await findById(userId);
    if (!user) {
        throw appError("USER_NOT_FOUND", "User not found");
    }

    return {
        user: toUserDto(user),
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

        return { user: toUserDto(user) };
    }

    const updatedUser = await updateUserStatus(user.id, nextStatus);
    if (!updatedUser) {
        throw appError("USER_NOT_FOUND", "User not found");
    }

    if (nextStatus === "disabled") {
        await clearRefreshTokenHash(updatedUser.id);
    }

    broadcastAdminUsers();
    broadcastUserStatus(updatedUser.id, nextStatus);
    return {
        user: toUserDto(updatedUser),
    };
}
