export function successResponse(data) {
    return {
        success: true,
        data,
    };
}

export function sendSuccess(res, data, status = 200) {
    return res.status(status).json(successResponse(data));
}
