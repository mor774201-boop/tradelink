import { Router } from "express";
import { generateProductImage, generateProductDescription } from "../controllers/aiController";
import { requireAuth } from "../middleware/auth";

export const aiRouter = Router();

aiRouter.post("/generate-image", requireAuth, generateProductImage);
aiRouter.post("/generate-description", requireAuth, generateProductDescription);
