import express from "express";
import { login, logout, me, refresh, register, streamAuthState } from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { loginRateLimit, refreshRateLimit, registerRateLimit } from "../middleware/rateLimit.js";
import { validateBody } from "../middleware/validateBody.js";
import { loginSchema, registerSchema } from "../validators/authSchemas.js";

const authRouter = express.Router();

authRouter.post("/register", registerRateLimit, validateBody(registerSchema), register);
authRouter.post("/login", loginRateLimit, validateBody(loginSchema), login);
authRouter.post("/refresh", refreshRateLimit, refresh);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.get("/stream", requireAuth, streamAuthState);

export default authRouter;
