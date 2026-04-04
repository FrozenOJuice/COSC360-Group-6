import express from "express";
import { getUserById, getUsers, streamAdminUsers, updateUserStatus, getAdminJobApplicants } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { deleteJob, updateJob } from "../controllers/jobController.js";
import {
    adminUserParamsSchema,
    listUsersQuerySchema,
    updateUserStatusParamsSchema,
    updateUserStatusSchema,
} from "../validators/adminSchemas.js";
import { jobParamsSchema } from "../validators/jobSchemas.js";
const adminRouter = express.Router();

adminRouter.use(requireAuth, requireRole("admin"));


adminRouter.get(
  "/jobs/:id/applicants",
  requireAuth,
  requireRole("admin"),
  validateParams(jobParamsSchema),
  getAdminJobApplicants
);

adminRouter.get("/users/stream", streamAdminUsers);
adminRouter.get("/users", validateQuery(listUsersQuerySchema), getUsers);
adminRouter.get("/users/:id", validateParams(adminUserParamsSchema), getUserById);
adminRouter.patch(
    "/users/:id/status",
    validateParams(updateUserStatusParamsSchema),
    validateBody(updateUserStatusSchema),
    updateUserStatus
);
adminRouter.patch("/jobs/:id",
    requireAuth,
    requireRole("admin"),
    validateParams(adminUserParamsSchema), 
    updateJob);
adminRouter.delete("/jobs/:id",
    requireAuth,
    requireRole("admin"),
    validateParams(adminUserParamsSchema), 
    deleteJob);

export default adminRouter;
