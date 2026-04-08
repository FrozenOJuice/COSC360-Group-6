import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { connectDB, disconnectDB } from "./config/database.js";
import { config } from "./config/env.js";
import app from "./app.js";

let server;

const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(config.PORT, "0.0.0.0", () => {
            console.log(`Server started on port ${config.PORT}.`);
        });
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

const stopServer = async () => {
    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((error) => (error ? reject(error) : resolve()));
            });
            console.log("HTTP server stopped.");
        }

        await disconnectDB();
        process.exit(0);
    } catch (error) {
        console.error(`Failed to stop server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
