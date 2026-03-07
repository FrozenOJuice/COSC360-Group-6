import express from "express";
import { config } from "./config/env.js";

const app = express();

app.use(express.json());

export default app;