import { z } from "zod";
import {
    buildObjectIdSchema,
    optionalTrimmedString,
    optionalTrimmedStringAllowEmpty,
} from "./schemaUtils.js";

const PROFILE_VISIBILITY_VALUES = ["private", "public"];

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

const visibilitySchema = z.enum(PROFILE_VISIBILITY_VALUES, {
    error: "Visibility must be public or private",
});

const emailSchema = z.string()
    .max(128, "Email must be at most 128 characters")
    .email("Invalid email")
    .transform((value) => value.toLowerCase());

export const profileUserParamsSchema = z.object({
    userId: buildObjectIdSchema("User id"),
}).strict();

export const updateSeekerProfileSchema = z.object({
    bio: optionalTrimmedStringAllowEmpty(
        z.string()
            .max(500, "Bio must be at most 500 characters")
    ),
    jobExperience: optionalStringArray("Job experience"),
    education: optionalStringArray("Education"),
    currentPosition: optionalTrimmedString(
        z.string()
            .min(2, "Current position must be at least 2 characters")
            .max(120, "Current position must be at most 120 characters")
    ),
    phone: optionalTrimmedString(phoneSchema),
    resumeLink: optionalTrimmedString(urlOrAppPathSchema),
    visibility: optionalTrimmedString(visibilitySchema),
}).strict();

export const updateEmployerProfileSchema = z.object({
    companyName: optionalTrimmedString(
        z.string()
            .min(2, "Company name must be at least 2 characters")
            .max(120, "Company name must be at most 120 characters")
    ),
    companyDescription: optionalTrimmedString(
        z.string()
            .min(2, "Company description must be at least 2 characters")
            .max(2000, "Company description must be at most 2000 characters")
    ),
    website: optionalTrimmedString(urlOrAppPathSchema),
    location: optionalTrimmedString(
        z.string()
            .min(2, "Location must be at least 2 characters")
            .max(120, "Location must be at most 120 characters")
    ),
    contactEmail: optionalTrimmedString(emailSchema),
    contactPhone: optionalTrimmedString(phoneSchema),
    visibility: optionalTrimmedString(visibilitySchema),
}).strict();
