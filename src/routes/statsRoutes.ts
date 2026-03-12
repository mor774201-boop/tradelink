import { Router } from "express";
import {
  getDashboardStats,
  getSupplierStats,
  getAdminStats,
  getWholesalerStats,
  getRetailerStats,
  getWholesalerReport,
} from "../controllers/statsController";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const statsRouter = Router();

statsRouter.get("/", requireAuth, getDashboardStats);
statsRouter.get("/supplier/:id", requireAuth, getSupplierStats);
statsRouter.get("/admin", requireAdmin, getAdminStats);
statsRouter.get("/wholesaler/:id", requireAuth, getWholesalerStats);
statsRouter.get("/wholesaler/:id/report", requireAuth, getWholesalerReport);
statsRouter.get("/retailer/:id", requireAuth, getRetailerStats);