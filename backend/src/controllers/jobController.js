import { asyncHandler } from "../middleware/asyncHandler.js";
import { getBoardJob, getBoardJobOptions, listBoardJobs } from "../services/jobService.js";

export const getJobs = asyncHandler(async (req, res) => {
    const result = await listBoardJobs(req.validatedQuery ?? req.query);
    return res.status(200).json(result);
});

export const getJobById = asyncHandler(async (req, res) => {
    const result = await getBoardJob(req.params?.id);
    return res.status(200).json(result);
});

export const getJobOptions = asyncHandler(async (req, res) => {
    const result = await getBoardJobOptions();
    return res.status(200).json(result);
});
