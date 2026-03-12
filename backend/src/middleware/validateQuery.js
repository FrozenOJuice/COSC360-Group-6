import { appError } from "../utils/appError.js";

function mapIssuesToDetails(issues) {
    return issues.flatMap((issue) => {
        if (issue.code === "unrecognized_keys" && Array.isArray(issue.keys)) {
            return issue.keys.map((key) => ({
                field: key,
                message: "Unknown field",
            }));
        }

        return [{
            field: issue.path.length ? issue.path.join(".") : "query",
            message: issue.message,
        }];
    });
}

export function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            return next(appError(
                "INVALID_REQUEST",
                "Invalid query parameters",
                mapIssuesToDetails(result.error.issues)
            ));
        }

        req.query = result.data;
        next();
    };
}
