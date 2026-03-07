export function notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    next(error);
}