import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { config } from "../config/env.js";
import { passwordRules } from "../validators/passwordRules.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 60,
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
        match: [/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"],
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        minlength: 5,
        maxlength: 128,
        match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    password: {
        type: String,
        required: true,
        minlength: passwordRules.minlength,
        maxlength: passwordRules.maxlength,
        match: passwordRules.match,
        select: false,
    },
    refreshTokenHash: {
        type: String,
        default: null,
        select: false,
    },
    role: {
        type: String,
        enum: ["seeker", "employer", "admin"],
        default: "seeker",
    },
    status: {
        type: String,
        enum: ["active", "disabled"],
        default: "active",
    },
});

userSchema.index(
    { name: "text", email: "text", username: "text" },
    {
        name: "user_text_search",
        weights: {
            email: 6,
            name: 3,
            username: 4,
        },
    }
);
userSchema.index({ name: 1, _id: 1 }, { name: "user_name_sort" });
userSchema.index({ role: 1, _id: 1 }, { name: "user_role_sort" });
userSchema.index({ status: 1, _id: 1 }, { name: "user_status_sort" });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, config.BCRYPT_SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
