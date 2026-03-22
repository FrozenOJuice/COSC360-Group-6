import { z } from "zod";

const emptyStringToUndefined = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
};

const optionalTrimmedString = (schema) =>
    z.preprocess(emptyStringToUndefined, schema.optional());

const optionalStringArray = (fieldName) =>
    z.preprocess(
        (value) => {
            if (!Array.isArray(value)) {
                return value;
            }

            return value
                .map((item) => (typeof item === "string" ? item.trim() : item))
                .filter((item) => typeof item === "string" && item.length > 0);
        },
        z.array(
            z.string()
                .min(1, `${fieldName} entries cannot be empty`)
                .max(160, `${fieldName} entries must be at most 160 characters`)
        )
            .max(20, `${fieldName} can contain at most 20 entries`)
            .optional()
    );

const urlOrAppPathSchema = z.string()
    .max(500, "URL must be at most 500 characters")
    .refine(
        (value) => value === "#"
            || value.startsWith("/")
            || value.startsWith("http://")
            || value.startsWith("https://"),
        "URL must start with /, http://, or https://"
    );

const phoneSchema = z.string()
    .max(40, "Phone number must be at most 40 characters")
    .regex(/^[0-9+().\-\s]+$/, "Phone number contains invalid characters");

export const updateProfileSchema = z.object({
    bio: optionalTrimmedString(
        z.string()
            .min(2, "Bio must be at least 2 characters")
            .max(500, "Bio must be at most 500 characters")
    ),
    jobExperience: optionalStringArray("Job experience"),
    education: optionalStringArray("Education"),
    currentPosition: optionalTrimmedString(
        z.string()
            .min(2, "Current position must be at least 2 characters")
            .max(120, "Current position must be at most 120 characters")
    ),
    profilePicture: optionalTrimmedString(urlOrAppPathSchema),
    phone: optionalTrimmedString(phoneSchema),
    resumeLink: optionalTrimmedString(urlOrAppPathSchema),
}).strict();
