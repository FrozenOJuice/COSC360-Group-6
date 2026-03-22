import { asyncHandler } from "../middleware/asyncHandler.js";
import { getBoardJob, getBoardJobOptions, listBoardJobs } from "../services/jobService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getJobs = asyncHandler(async (req, res) => {
    const result = await listBoardJobs(req.validatedQuery ?? req.query);
    return sendSuccess(res, result);
});

export const getJobById = asyncHandler(async (req, res) => {
    const result = await getBoardJob(req.params?.id);
    return sendSuccess(res, result);
});

export const getJobOptions = asyncHandler(async (req, res) => {
    const result = await getBoardJobOptions();
    return sendSuccess(res, result);
});
