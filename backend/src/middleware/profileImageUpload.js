import multer from "multer";
import { appError } from "../utils/appError.js";

const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]);

function createUploadError(field, message) {
    return appError("INVALID_REQUEST", message, [{
        field,
        message,
    }]);
}

function createImageUploadMiddleware({ fieldName }) {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (_req, file, callback) => {
            if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
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

export const uploadSeekerProfilePicture = createImageUploadMiddleware({
    fieldName: "profilePicture",
});

export const uploadEmployerProfileLogo = createImageUploadMiddleware({
    fieldName: "logo",
});
