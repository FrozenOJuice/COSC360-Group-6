import mongoose from "mongoose";
import { config } from "./env.js";
import { seedDatabaseIfNeeded } from "./seed.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Database connected successfully.");

        await seedDatabaseIfNeeded();
    } catch (error) {
        throw new Error(`Failed to connect to database: ${error.message}`);
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log("Database disconnected successfully.");
    } catch (error) {
        throw new Error(`Failed to disconnect from database: ${error.message}`);
    }
};
