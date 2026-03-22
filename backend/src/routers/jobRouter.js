import express from "express";
import { getJobById, getJobOptions, getJobs } from "../controllers/jobController.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { jobParamsSchema, listJobsQuerySchema } from "../validators/jobSchemas.js";

const jobRouter = express.Router();

jobRouter.get("/", validateQuery(listJobsQuerySchema), getJobs);
jobRouter.get("/options", getJobOptions);
jobRouter.get("/:id", validateParams(jobParamsSchema), getJobById);

export default jobRouter;
