import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminRouter from "./routers/adminRouter.js";
import authRouter from "./routers/authRouter.js";
import employerProfileRouter from "./routers/employerProfileRouter.js";
import jobRouter from "./routers/jobRouter.js";
import seekerProfileRouter from "./routers/seekerProfileRouter.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sendSuccess } from "./utils/apiResponse.js";

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    sendSuccess(res, { message: "API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/seeker-profile", seekerProfileRouter);
app.use("/api/employer-profile", employerProfileRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
