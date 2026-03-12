import { asyncHandler } from "../middleware/asyncHandler.js";
import { listAdminUsers, setManagedUserStatus } from "../services/adminService.js";

export const getUsers = asyncHandler(async (req, res) => {
    const result = await listAdminUsers(req.query);
    return res.status(200).json(result);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
    const userId = req.params && req.params.id;
    const { status } = req.body || {};
    const result = await setManagedUserStatus({ userId, status });
    return res.status(200).json(result);
});
