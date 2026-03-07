import dotenv from "dotenv";

dotenv.config();

const required = [
    "PORT",
    "NODE_ENV",
    "MONGO_URI",
    "BCRYPT_SALT_ROUNDS",
]

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`${key} is not configured`);
    }
}

export const config = Object.freeze({
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    MONGO_URI: process.env.MONGO_URI,
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),
});
