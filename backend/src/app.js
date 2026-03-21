import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminRouter from "./routers/adminRouter.js";
import authRouter from "./routers/authRouter.js";
import profileRouter from "./routers/profileRouter.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.status(200).json({ message: "API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/profile", profileRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
