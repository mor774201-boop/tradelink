import { Router } from "express";
import * as reportController from "../controllers/reportController";

const router = Router();

// GET /api/wallet/:userId/history — get wallet history
router.get("/:userId/history", reportController.getWalletHistory);

// GET /api/wallet/:userId/summary — get financial summary
router.get("/:userId/summary", reportController.getFinancialSummary);

export default router;
