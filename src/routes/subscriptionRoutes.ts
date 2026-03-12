import { Router } from "express";
import * as subscriptionController from "../controllers/subscriptionController";

const router = Router();

// GET /api/subscription/:userId — check subscription status
router.get("/:userId", subscriptionController.checkSubscriptionStatus);

// POST /api/subscription/pay — pay subscription
router.post("/pay", subscriptionController.paySubscription);

// PATCH /api/subscription/:userId/toggle — admin toggle subscription
router.patch("/:userId/toggle", subscriptionController.toggleSubscription);

export default router;

