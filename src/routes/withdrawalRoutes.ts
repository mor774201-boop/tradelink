import { Router } from "express";
import * as withdrawalController from "../controllers/withdrawalController";

const router = Router();

// GET /api/withdrawals/:userId — get withdrawal history
router.get("/:userId", withdrawalController.getUserWithdrawals);

// GET /api/withdrawals — admin: get all withdrawal requests
router.get("/", withdrawalController.listAllWithdrawals);

// POST /api/withdrawals — create withdrawal request
router.post("/", withdrawalController.createWithdrawal);

// PATCH /api/withdrawals/:id/status — admin approve/reject
router.patch("/:id/status", withdrawalController.updateWithdrawalStatus);

export default router;

