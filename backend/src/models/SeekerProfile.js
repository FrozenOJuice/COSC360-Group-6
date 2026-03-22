import mongoose from "mongoose";
import {
    allowOptionalPhone,
    allowOptionalUrlOrAppPath,
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
        minlength: 2,
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
    profilePicture: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "/default-profile.png",
        validate: {
            validator: allowOptionalUrlOrAppPath,
            message: "Profile picture URL must start with /, http://, or https://",
        },
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
    resumeLink: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "#",
        validate: {
            validator: allowOptionalUrlOrAppPath,
            message: "Resume link must start with /, http://, or https://",
        },
    },
}, {
    collection: "seekerProfiles",
});

const SeekerProfile = mongoose.models.SeekerProfile || mongoose.model("SeekerProfile", seekerProfileSchema);
export default SeekerProfile;
