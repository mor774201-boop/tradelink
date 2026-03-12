import { Request, Response, NextFunction } from "express";
import { Shipment } from "../models/Shipment";
import { Order } from "../models/Order";

export async function listShipments(_req: Request, res: Response, next: NextFunction) {
    try {
        const shipments = await Shipment.findAll({ include: [{ model: Order, as: "order" }] });
        res.json({ success: true, data: shipments });
    } catch (err) { next(err); }
}

export async function getShipment(req: Request, res: Response, next: NextFunction) {
    try {
        const shipment = await Shipment.findByPk(req.params.id, { include: [{ model: Order, as: "order" }] });
        if (!shipment) return res.status(404).json({ success: false, error: "Shipment not found" });
        res.json({ success: true, data: shipment });
    } catch (err) { next(err); }
}

export async function trackShipment(req: Request, res: Response, next: NextFunction) {
    try {
        const { tracking_number } = req.params;
        const shipment = await Shipment.findOne({ where: { tracking_number }, include: [{ model: Order, as: "order" }] });
        if (!shipment) return res.status(404).json({ success: false, error: "Tracking number not found" });
        res.json({ success: true, data: shipment });
    } catch (err) { next(err); }
}

export async function createShipment(req: Request, res: Response, next: NextFunction) {
    try {
        const { order_id, company, tracking_number, status } = req.body;
        if (!order_id || !company || !tracking_number) {
            return res.status(400).json({ success: false, error: "Required: order_id, company, tracking_number" });
        }
        const shipment = await Shipment.create({ order_id, company, tracking_number, status: status || "created" });
        res.status(201).json({ success: true, data: shipment });
    } catch (err: any) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ success: false, error: "Tracking number already exists" });
        }
        next(err);
    }
}

export async function updateShipmentStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { status } = req.body;
        const validStatuses = ["created", "picked_up", "in_transit", "out_for_delivery", "delivered", "returned"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: `status must be one of: ${validStatuses.join(", ")}` });
        }
        const shipment = await Shipment.findByPk(req.params.id);
        if (!shipment) return res.status(404).json({ success: false, error: "Shipment not found" });
        const delivered_at = status === "delivered" ? new Date() : shipment.delivered_at;
        await shipment.update({ status, delivered_at });
        res.json({ success: true, data: shipment });
    } catch (err) { next(err); }
}
