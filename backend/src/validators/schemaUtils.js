import { z } from "zod";

export const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export function emptyStringToUndefined(value) {
    if (typeof value !== "string") {
        return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}

export function optionalTrimmedString(schema) {
    return z.preprocess(emptyStringToUndefined, schema.optional());
}

export function optionalTrimmedStringAllowEmpty(schema) {
    return z.preprocess(
        (value) => (typeof value === "string" ? value.trim() : value),
        schema.optional()
    );
}

export function buildObjectIdSchema(fieldName) {
    return z.string()
        .trim()
        .regex(OBJECT_ID_PATTERN, `${fieldName} must be a valid MongoDB ObjectId`);
}

export function createPageQuerySchema(defaultPage = 1) {
    return z.coerce.number()
        .int("Page must be an integer")
        .min(1, "Page must be at least 1")
        .default(defaultPage);
}

export function createLimitQuerySchema(defaultLimit = 25, maxLimit = 100) {
    return z.coerce.number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(maxLimit, `Limit must be at most ${maxLimit}`)
        .default(defaultLimit);
}
