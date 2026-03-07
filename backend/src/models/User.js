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
    role: {
        type: String,
        enum: ["seeker", "employer", "admin"],
        default: "seeker",
    },
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, config.BCRYPT_SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
