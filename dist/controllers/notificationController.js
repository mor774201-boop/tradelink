"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotifications = listNotifications;
exports.createNotification = createNotification;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
exports.deleteNotification = deleteNotification;
exports.deleteAllNotifications = deleteAllNotifications;
const Notification_1 = require("../models/Notification");
async function listNotifications(req, res, next) {
    try {
        const userId = req.userId;
        const notifications = await Notification_1.Notification.findAll({
            where: { user_id: userId },
            order: [["created_at", "DESC"]]
        });
        res.json({ success: true, data: notifications });
    }
    catch (err) {
        next(err);
    }
}
async function createNotification(req, res, next) {
    try {
        const { user_id, title, message, type } = req.body;
        if (!user_id || !title || !message) {
            return res.status(400).json({ success: false, error: "Required: user_id, title, message" });
        }
        const notification = await Notification_1.Notification.create({ user_id, title, message, type: type || "info" });
        res.status(201).json({ success: true, data: notification });
    }
    catch (err) {
        next(err);
    }
}
async function markAsRead(req, res, next) {
    try {
        const notification = await Notification_1.Notification.findByPk(req.params.id);
        if (!notification)
            return res.status(404).json({ success: false, error: "Notification not found" });
        await notification.update({ read: true });
        res.json({ success: true, data: notification });
    }
    catch (err) {
        next(err);
    }
}
async function markAllAsRead(req, res, next) {
    try {
        const userId = req.userId;
        await Notification_1.Notification.update({ read: true }, { where: { user_id: userId, read: false } });
        res.json({ success: true, message: "All notifications marked as read" });
    }
    catch (err) {
        next(err);
    }
}
async function deleteNotification(req, res, next) {
    try {
        const notification = await Notification_1.Notification.findByPk(req.params.id);
        if (!notification)
            return res.status(404).json({ success: false, error: "Notification not found" });
        await notification.destroy();
        res.json({ success: true, message: "Notification deleted" });
    }
    catch (err) {
        next(err);
    }
}
async function deleteAllNotifications(req, res, next) {
    try {
        const userId = req.userId;
        await Notification_1.Notification.destroy({ where: { user_id: userId } });
        res.json({ success: true, message: "All notifications deleted" });
    }
    catch (err) {
        next(err);
    }
}
