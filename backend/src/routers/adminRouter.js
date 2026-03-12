import express from "express";
import { getUsers, updateUserStatus } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { listUsersQuerySchema, updateUserStatusSchema } from "../validators/adminSchemas.js";

const adminRouter = express.Router();

adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/users", validateQuery(listUsersQuerySchema), getUsers);
adminRouter.patch("/users/:id/status", validateBody(updateUserStatusSchema), updateUserStatus);

export default adminRouter;
