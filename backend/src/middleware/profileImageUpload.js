import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { appError } from "../utils/appError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const profileUploadsDir = path.resolve(__dirname, "../../uploads/profile-images");

fs.mkdirSync(profileUploadsDir, { recursive: true });

const IMAGE_EXTENSION_BY_TYPE = Object.freeze({
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
});

function createUploadError(field, message) {
    return appError("INVALID_REQUEST", message, [{
        field,
        message,
    }]);
}

function createImageUploadMiddleware({ fieldName, filenamePrefix }) {
    const storage = multer.diskStorage({
        destination: (_req, _file, callback) => {
            callback(null, profileUploadsDir);
        },
        filename: (req, file, callback) => {
            const extension = IMAGE_EXTENSION_BY_TYPE[file.mimetype]
                || path.extname(file.originalname || "").toLowerCase()
                || ".bin";
            const safeUserId = String(req.auth?.userId || "user").replace(/[^a-zA-Z0-9_-]/g, "");

            callback(null, `${filenamePrefix}-${safeUserId}-${Date.now()}-${randomUUID()}${extension}`);
        },
    });

    const upload = multer({
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (_req, file, callback) => {
            if (!IMAGE_EXTENSION_BY_TYPE[file.mimetype]) {
                callback(createUploadError(
                    fieldName,
                    "Image must be a JPG, PNG, GIF, or WebP file"
                ));
                return;
            }

            callback(null, true);
        },
    }).single("image");

    return (req, res, next) => {
        upload(req, res, (error) => {
            if (error) {
                if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
                    next(createUploadError(fieldName, "Image must be 5MB or smaller"));
                    return;
                }

                next(error);
                return;
            }

            if (!req.file) {
                next(createUploadError(fieldName, "Image file is required"));
                return;
            }

            next();
        });
    };
}

export function getUploadedProfileImagePath(file) {
    return `/uploads/profile-images/${file.filename}`;
}

export const uploadSeekerProfilePicture = createImageUploadMiddleware({
    fieldName: "profilePicture",
    filenamePrefix: "seeker-profile",
});

export const uploadEmployerProfileLogo = createImageUploadMiddleware({
    fieldName: "logo",
    filenamePrefix: "employer-logo",
});
