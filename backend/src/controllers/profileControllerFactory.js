import { asyncHandler } from "../middleware/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { addProfileClient, removeProfileClient } from "../utils/profileEventBus.js";

export function createProfileController({
    getCurrentProfile,
    getCurrentProfileMedia,
    getProfileMedia,
    getVisibleProfile,
    removeCurrentProfileMedia,
    setCurrentProfileMedia,
    updateCurrentProfile,
}) {
    return {
        streamSelfProfile(req, res) {
            const userId = req.auth?.userId;

            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.flushHeaders();

            addProfileClient(userId, res);
            res.write("event: connected\ndata: {}\n\n");

            const heartbeat = setInterval(() => {
                res.write(":heartbeat\n\n");
            }, 30000);

            req.on("close", () => {
                clearInterval(heartbeat);
                removeProfileClient(userId, res);
            });
        },

        getSelfProfile: asyncHandler(async (req, res) => {
            const profile = await getCurrentProfile(req.auth?.userId);
            sendSuccess(res, profile);
        }),

        updateSelfProfile: asyncHandler(async (req, res) => {
            const profile = await updateCurrentProfile(req.auth?.userId, req.body);
            sendSuccess(res, profile);
        }),

        uploadSelfProfileMedia: asyncHandler(async (req, res) => {
            const profile = await setCurrentProfileMedia(req.auth?.userId, req.file);
            sendSuccess(res, profile);
        }),

        removeSelfProfileMedia: asyncHandler(async (req, res) => {
            const profile = await removeCurrentProfileMedia(req.auth?.userId);
            sendSuccess(res, profile);
        }),

        getSelfProfileMedia: asyncHandler(async (req, res) => {
            const media = await getCurrentProfileMedia(req.auth?.userId);
            res.set("Content-Type", media.contentType);
            res.status(200).send(media.data);
        }),

        getProfileByUserId: asyncHandler(async (req, res) => {
            const profile = await getVisibleProfile(req.params?.userId, req.auth);
            sendSuccess(res, profile);
        }),

        getProfileMediaByUserId: asyncHandler(async (req, res) => {
            const media = await getProfileMedia(req.params?.userId, req.auth);
            res.set("Content-Type", media.contentType);
            res.status(200).send(media.data);
        }),
    };
}
