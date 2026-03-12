import { Request, Response, NextFunction } from "express";
import { Notification } from "../models/Notification";
import { User } from "../models/User";

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as any).userId;
        const notifications = await Notification.findAll({
            where: { user_id: userId },
            order: [["created_at", "DESC"]]
        });
        res.json({ success: true, data: notifications });
    } catch (err) { next(err); }
}

export async function createNotification(req: Request, res: Response, next: NextFunction) {
    try {
        const { user_id, title, message, type } = req.body;
        if (!user_id || !title || !message) {
            return res.status(400).json({ success: false, error: "Required: user_id, title, message" });
        }
        const notification = await Notification.create({ user_id, title, message, type: type || "info" });
        res.status(201).json({ success: true, data: notification });
    } catch (err) { next(err); }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) return res.status(404).json({ success: false, error: "Notification not found" });
        await notification.update({ read: true });
        res.json({ success: true, data: notification });
    } catch (err) { next(err); }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as any).userId;
        await Notification.update({ read: true }, { where: { user_id: userId, read: false } });
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) { next(err); }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) return res.status(404).json({ success: false, error: "Notification not found" });
        await notification.destroy();
        res.json({ success: true, message: "Notification deleted" });
    } catch (err) { next(err); }
}

export async function deleteAllNotifications(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as any).userId;
        await Notification.destroy({ where: { user_id: userId } });
        res.json({ success: true, message: "All notifications deleted" });
    } catch (err) { next(err); }
}
