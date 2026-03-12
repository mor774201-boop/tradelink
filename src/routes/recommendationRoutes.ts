import { Router } from "express";
import * as recommendationController from "../controllers/recommendationController";

export const recommendationRouter = Router();

recommendationRouter.get("/", recommendationController.getRecommendations);
recommendationRouter.get("/similar/:product_id", recommendationController.getSimilarProducts);
