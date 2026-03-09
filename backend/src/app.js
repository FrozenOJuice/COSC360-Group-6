import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routers/authRouter.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.post("/submit", (req, res) => {
  const { name, role } = req.body;

  res.json({
    message: `Received ${name} with role ${role}`
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
