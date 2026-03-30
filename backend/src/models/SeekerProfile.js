import mongoose from "mongoose";
import {
    allowOptionalPhone,
    buildStringArrayField,
} from "./profileFieldHelpers.js";

const seekerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    visibility: {
        type: String,
        enum: ["private", "public"],
        default: "private",
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    jobExperience: buildStringArrayField("Job experience"),
    education: buildStringArrayField("Education"),
    currentPosition: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 120,
    },
    profilePictureData: {
        type: Buffer,
        select: false,
    },
    profilePictureContentType: {
        type: String,
        trim: true,
        select: false,
    },
    hasUploadedProfilePicture: {
        type: Boolean,
        default: false,
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 40,
        validate: {
            validator: allowOptionalPhone,
            message: "Phone number contains invalid characters",
        },
    },
    resumeData: {
        type: Buffer,
        select: false,
    },
    resumeContentType: {
        type: String,
        trim: true,
        select: false,
    },
    hasUploadedResume: {
        type: Boolean,
        default: false,
    },
}, {
    collection: "seekerProfiles",
});

const SeekerProfile = mongoose.models.SeekerProfile || mongoose.model("SeekerProfile", seekerProfileSchema);
export default SeekerProfile;
