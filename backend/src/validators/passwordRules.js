export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$/;

export const PASSWORD_MESSAGES = Object.freeze({
    MIN_LENGTH: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    MAX_LENGTH: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
    PATTERN: "Password must include uppercase, lowercase, number, and symbol",
});

export const passwordRules = Object.freeze({
    minlength: [PASSWORD_MIN_LENGTH, PASSWORD_MESSAGES.MIN_LENGTH],
    maxlength: [PASSWORD_MAX_LENGTH, PASSWORD_MESSAGES.MAX_LENGTH],
    match: [PASSWORD_PATTERN, PASSWORD_MESSAGES.PATTERN],
});
