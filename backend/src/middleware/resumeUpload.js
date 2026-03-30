import multer from "multer";
import { appError } from "../utils/appError.js";

const ALLOWED_RESUME_TYPES = new Set(["application/pdf"]);

function createUploadError(message) {
    return appError("INVALID_REQUEST", message, [{
        field: "resume",
        message,
    }]);
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
        if (!ALLOWED_RESUME_TYPES.has(file.mimetype)) {
            callback(createUploadError("Resume must be a PDF file"));
            return;
        }

        callback(null, true);
    },
}).single("resume");

export function uploadSeekerResume(req, res, next) {
    upload(req, res, (error) => {
        if (error) {
            if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
                next(createUploadError("Resume must be 5MB or smaller"));
                return;
            }

            next(error);
            return;
        }

        if (!req.file) {
            next(createUploadError("Resume file is required"));
            return;
        }

        next();
    });
}
