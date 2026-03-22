import mongoose from "mongoose";
import { allowOptionalPhone, allowOptionalUrlOrAppPath } from "./profileFieldHelpers.js";

const employerProfileSchema = new mongoose.Schema({
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
    companyName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 120,
    },
    companyDescription: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 2000,
    },
    website: {
        type: String,
        trim: true,
        maxlength: 500,
        validate: {
            validator: allowOptionalUrlOrAppPath,
            message: "Website must start with /, http://, or https://",
        },
    },
    logo: {
        type: String,
        trim: true,
        maxlength: 500,
        validate: {
            validator: allowOptionalUrlOrAppPath,
            message: "Logo URL must start with /, http://, or https://",
        },
    },
    location: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 120,
    },
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 128,
        match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    contactPhone: {
        type: String,
        trim: true,
        maxlength: 40,
        validate: {
            validator: allowOptionalPhone,
            message: "Contact phone contains invalid characters",
        },
    },
}, {
    collection: "employerProfiles",
});

const EmployerProfile = mongoose.models.EmployerProfile
    || mongoose.model("EmployerProfile", employerProfileSchema);
export default EmployerProfile;
