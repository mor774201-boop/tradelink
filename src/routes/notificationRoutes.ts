import { Router } from "express";
import { listNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from "../controllers/notificationController";
import { requireAuth } from "../middleware/auth";

export const notificationRouter = Router();

notificationRouter.get("/", requireAuth, listNotifications);
notificationRouter.post("/", createNotification);
notificationRouter.patch("/read-all", requireAuth, markAllAsRead);
notificationRouter.delete("/clear", requireAuth, deleteAllNotifications);
notificationRouter.patch("/:id/read", markAsRead);
notificationRouter.delete("/:id", deleteNotification);
