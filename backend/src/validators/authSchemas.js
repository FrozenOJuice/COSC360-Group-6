import { z } from "zod";
import {
    PASSWORD_MAX_LENGTH,
    PASSWORD_MESSAGES,
    PASSWORD_MIN_LENGTH,
    PASSWORD_PATTERN,
} from "./passwordRules.js";

const requiredString = (fieldName) => z.string({
    error: `${fieldName} is required`,
}).trim().min(1, `${fieldName} is required`);

const emailSchema = requiredString("Email")
    .max(128, "Email must be at most 128 characters")
    .email("Invalid email")
    .transform((value) => value.toLowerCase());

const registrationPasswordSchema = z.string({
    error: "Password is required",
})
    .min(1, "Password is required")
    .min(PASSWORD_MIN_LENGTH, PASSWORD_MESSAGES.MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH, PASSWORD_MESSAGES.MAX_LENGTH)
    .regex(PASSWORD_PATTERN, PASSWORD_MESSAGES.PATTERN);

const loginPasswordSchema = z.string({
    error: "Password is required",
}).min(1, "Password is required");

export const registerSchema = z.object({
    name: requiredString("Name")
        .min(2, "Name must be at least 2 characters")
        .max(60, "Name must be at most 60 characters"),
    username: requiredString("Username")
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
    email: emailSchema,
    password: registrationPasswordSchema,
    confirmPassword: registrationPasswordSchema,
    role: z.enum(["seeker", "employer"]).optional(),
}).strict().superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: "custom",
            path: ["confirmPassword"],
            message: "Passwords do not match",
        });
    }
});

export const loginSchema = z.object({
    email: emailSchema,
    password: loginPasswordSchema,
}).strict();
