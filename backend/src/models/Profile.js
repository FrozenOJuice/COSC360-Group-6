import mongoose from "mongoose";

const URL_OR_APP_PATH_PATTERN = /^(#|\/|https?:\/\/)/;
const PHONE_PATTERN = /^[0-9+().\-\s]+$/;

function trimStringArray(values) {
    if (!Array.isArray(values)) {
        return values;
    }

    return values
        .map((value) => (typeof value === "string" ? value.trim() : value))
        .filter((value) => typeof value === "string" && value.length > 0);
}

function buildStringArrayField(fieldName) {
    return {
        type: [{
            type: String,
            trim: true,
            minlength: [1, `${fieldName} entries cannot be empty`],
            maxlength: [160, `${fieldName} entries must be at most 160 characters`],
        }],
        default: [],
        set: trimStringArray,
        validate: {
            validator: (value) => Array.isArray(value) && value.length <= 20,
            message: `${fieldName} can contain at most 20 entries`,
        },
    };
}

function allowOptionalUrlOrAppPath(value) {
    return value == null || value === "" || URL_OR_APP_PATH_PATTERN.test(value);
}

function allowOptionalPhone(value) {
    return value == null || value === "" || PHONE_PATTERN.test(value);
}

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
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
        default: '/default-profile.png',
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
        default: '#',
        validate: {
            validator: allowOptionalUrlOrAppPath,
            message: "Resume link must start with /, http://, or https://",
        },
    }
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export default Profile;
