import { asyncHandler } from "../middleware/asyncHandler.js";
import {
    createEmployerJob,
    deleteEmployerJob,
    getBoardJob,
    getBoardJobOptions,
    listBoardJobs,
    listEmployerJobs,
    listAdminJobs,
    updateEmployerJob,
} from "../services/jobService.js";
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

export const getEmployerJobs = asyncHandler(async (req, res) => {
    const result = await listEmployerJobs(req.auth?.userId, req.validatedQuery ?? req.query);
    return sendSuccess(res, result);
});

export const getAdminJobs = asyncHandler(async (req, res) => {
    const result = await listAdminJobs(req.auth?.userId, req.auth?.role, req.validatedQuery ?? req.query);
    return sendSuccess(res, result);
});

export const createJob = asyncHandler(async (req, res) => {
    const result = await createEmployerJob(req.auth?.userId, req.body);
    return sendSuccess(res, result, 201);
});

export const updateJob = asyncHandler(async (req, res) => {
    const result = await updateEmployerJob(req.auth?.userId, req.auth?.role, req.params?.id, req.body);
    return sendSuccess(res, result);
});

export const deleteJob = asyncHandler(async (req, res) => {
    const result = await deleteEmployerJob(req.auth?.userId, req.auth?.role, req.params?.id);
    return sendSuccess(res, result);
});
