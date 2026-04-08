import { config } from "./env.js";
import User from "../models/User.js";
import { createUser } from "../repositories/userRepository.js";

export const DEFAULT_ADMIN_CREDENTIALS = Object.freeze({
    name: "Admin User",
    username: config.ADMIN_USERNAME,
    email: config.ADMIN_EMAIL,
    password: config.ADMIN_PASSWORD,
    role: "admin",
});

const defaultUsers = [
    DEFAULT_ADMIN_CREDENTIALS,
];

export async function seedDatabaseIfNeeded() {
    if (config.NODE_ENV === "production") {
        return false;
    }

    const existingUserCount = await User.countDocuments().exec();
    if (existingUserCount > 0) {
        return false;
    }

    await Promise.all(defaultUsers.map((userData) => createUser(userData)));

    console.log("Default database seed applied.");
    console.log("Default admin login:");
    console.log(`  email: ${DEFAULT_ADMIN_CREDENTIALS.email}`);
    console.log(`  password: ${DEFAULT_ADMIN_CREDENTIALS.password}`);
    console.log("Use these credentials to log in as the admin user.");

    return true;
}
