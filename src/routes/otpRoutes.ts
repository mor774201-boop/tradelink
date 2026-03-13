import { Router } from "express";
import { requestOTP, verifyOTP } from "../controllers/otpController";
import { requireAuth } from "../middleware/auth";

export const otpRouter = Router();

otpRouter.post("/request", requireAuth, requestOTP);
otpRouter.post("/verify", requireAuth, verifyOTP);
