const STATUS_BY_CODE = Object.freeze({
    INVALID_JSON: 400,
    INVALID_REQUEST: 400,
    VALIDATION_ERROR: 400,
    MISSING_USER_ID: 400,
    INVALID_TOKEN_PAYLOAD: 400,
    UNAUTHORIZED: 401,
    INVALID_CREDENTIALS: 401,
    MISSING_ACCESS_TOKEN: 401,
    INVALID_ACCESS_TOKEN: 401,
    MISSING_REFRESH_TOKEN: 401,
    INVALID_REFRESH_TOKEN: 401,
    ROLE_NOT_ALLOWED: 403,
    ACCOUNT_DISABLED: 403,
    NOT_FOUND: 404,
    USER_NOT_FOUND: 404,
    EMAIL_ALREADY_IN_USE: 409,
    USERNAME_ALREADY_IN_USE: 409,
    DUPLICATE_KEY: 409,
});

export function errorHandler(err, req, res, next) {
    if (err && err.type === "entity.parse.failed") {
        err.status = 400;
        err.code = "INVALID_JSON";
        err.message = "Invalid JSON format";
    }

    if (err && !err.status && !err.statusCode && err.name === "ValidationError") {
        err.status = 400;
        err.code = "VALIDATION_ERROR";
        err.message = "Validation failed";
        err.details = Object.values(err.errors || {}).map((fieldError) => ({
            field: fieldError.path,
            message: fieldError.message,
        }));
    }

    if (err && !err.status && !err.statusCode && err.name === "CastError") {
        err.status = 400;
        err.code = "INVALID_REQUEST";
        err.message = "Invalid request parameter";
        err.details = [{
            field: err.path || "value",
            message: `Invalid value: ${err.value}`,
        }];
    }

    if (err && !err.status && !err.statusCode && err.name === "MongoServerError" && err.code === 11000) {
        err.status = 409;
        if (err.keyPattern && err.keyPattern.email) {
            err.code = "EMAIL_ALREADY_IN_USE";
            err.message = "Email is already registered";
        } else if (err.keyPattern && err.keyPattern.username) {
            err.code = "USERNAME_ALREADY_IN_USE";
            err.message = "Username is already taken";
        } else {
            err.code = "DUPLICATE_KEY";
            err.message = "Resource already exists";
        }
        err.details = err.keyValue || err.details;
    }

    const payload = errorResponse(err);
    res.status(payload.status).json(payload);
}



function errorResponse(err) {
    err = err || {};

    let status;
    const rawStatus = parseInt(err.statusCode || err.status, 10);
    if (rawStatus >= 400 && rawStatus <= 599) {
        status = rawStatus;
    } else if (err.code && STATUS_BY_CODE[err.code]) {
        status = STATUS_BY_CODE[err.code];
    } else {
        status = 500;
    }

    let code = "INTERNAL_SERVER_ERROR";
    if (err.code) code = err.code;
    
    let message = "Internal Server Error";
    if (err.message) message = err.message;
    const response = {
        success: false,
        status,
        code,
        message,
    };

    if (err.details) response.details = err.details;
    if (process.env.NODE_ENV !== "production" && err.stack) response.stack = err.stack;

    return response;
}
