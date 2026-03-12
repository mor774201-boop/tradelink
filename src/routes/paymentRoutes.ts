import { Router } from "express";
import { listPayments, getPayment, createPayment, updatePaymentStatus, getBalance, depositToWallet, getPaymentMethods, verifyPaymentOTP, uploadPaymentProof, approvePayment } from "../controllers/paymentController";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const paymentRouter = Router();

paymentRouter.get("/methods", getPaymentMethods);
paymentRouter.get("/", requireAuth, listPayments);
paymentRouter.post("/", requireAuth, uploadPaymentProof.single("proof"), createPayment);
paymentRouter.post("/deposit", requireAuth, uploadPaymentProof.single("proof"), depositToWallet);
paymentRouter.post("/verify-otp", requireAuth, verifyPaymentOTP);
paymentRouter.get("/balance/:userId", requireAuth, getBalance);
paymentRouter.get("/:id", requireAuth, getPayment);
paymentRouter.patch("/:id/status", requireAdmin, updatePaymentStatus);
paymentRouter.post("/:id/approve", requireAdmin, approvePayment);
