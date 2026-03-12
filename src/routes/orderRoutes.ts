import { Router } from "express";
import { listOrders, getOrder, createOrder, updateOrderStatus, deleteOrder } from "../controllers/orderController";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const orderRouter = Router();

orderRouter.get("/", requireAuth, listOrders);
orderRouter.post("/", requireAuth, createOrder);
orderRouter.get("/:id", requireAuth, getOrder);
orderRouter.patch("/:id/status", requireAuth, updateOrderStatus);
orderRouter.delete("/:id", requireAdmin, deleteOrder);
