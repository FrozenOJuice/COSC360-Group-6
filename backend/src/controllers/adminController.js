import { asyncHandler } from "../middleware/asyncHandler.js";
import { getManagedUser, listAdminUsers, setManagedUserStatus } from "../services/adminService.js";
import { addAdminClient, removeAdminClient } from "../utils/adminEventBus.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getAdminJobApplicants as getAdminJobApplicantsService, } from "../services/jobService.js";

export const getUsers = asyncHandler(async (req, res) => {
    const result = await listAdminUsers(req.validatedQuery ?? req.query);
    return sendSuccess(res, result);
});

export const getUserById = asyncHandler(async (req, res) => {
    const userId = req.params && req.params.id;
    const result = await getManagedUser(userId);
    return sendSuccess(res, result);
});

export const getAdminJobApplicants = asyncHandler(async (req, res) => {
  const result = await getAdminJobApplicantsService(req.params?.id);
  return sendSuccess(res, result);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
    const userId = req.params && req.params.id;
    const { status } = req.body || {};
    const result = await setManagedUserStatus({ userId, status });
    return sendSuccess(res, result);
});

export function streamAdminUsers(req, res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    addAdminClient(res);
    res.write("event: connected\ndata: {}\n\n");

    const heartbeat = setInterval(() => {
        res.write(":heartbeat\n\n");
    }, 30000);

    req.on("close", () => {
        clearInterval(heartbeat);
        removeAdminClient(res);
    });
}
