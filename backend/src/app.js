import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routers/authRouter.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.status(200).json({ message: "API is running" });
});

app.use("/api/auth", authRouter);

app.post("/login", (req,res)=>{
    console.log("HIT /login", req.body);
    const username = req.body.username;
    const password = req.body.password;

    console.log(username, password);

    if(username === "admin" && password === "1234"){
        res.json({message: "Login successful"});
    }
    else{
        res.json({message: "Invalid credentials"});
    }
});

app.use(notFound);
app.use(errorHandler);

export default app;
