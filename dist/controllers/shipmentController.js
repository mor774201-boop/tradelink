"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShipments = listShipments;
exports.getShipment = getShipment;
exports.trackShipment = trackShipment;
exports.createShipment = createShipment;
exports.updateShipmentStatus = updateShipmentStatus;
const Shipment_1 = require("../models/Shipment");
const Order_1 = require("../models/Order");
async function listShipments(_req, res, next) {
    try {
        const shipments = await Shipment_1.Shipment.findAll({ include: [{ model: Order_1.Order, as: "order" }] });
        res.json({ success: true, data: shipments });
    }
    catch (err) {
        next(err);
    }
}
async function getShipment(req, res, next) {
    try {
        const shipment = await Shipment_1.Shipment.findByPk(req.params.id, { include: [{ model: Order_1.Order, as: "order" }] });
        if (!shipment)
            return res.status(404).json({ success: false, error: "Shipment not found" });
        res.json({ success: true, data: shipment });
    }
    catch (err) {
        next(err);
    }
}
async function trackShipment(req, res, next) {
    try {
        const { tracking_number } = req.params;
        const shipment = await Shipment_1.Shipment.findOne({ where: { tracking_number }, include: [{ model: Order_1.Order, as: "order" }] });
        if (!shipment)
            return res.status(404).json({ success: false, error: "Tracking number not found" });
        res.json({ success: true, data: shipment });
    }
    catch (err) {
        next(err);
    }
}
async function createShipment(req, res, next) {
    try {
        const { order_id, company, tracking_number, status } = req.body;
        if (!order_id || !company || !tracking_number) {
            return res.status(400).json({ success: false, error: "Required: order_id, company, tracking_number" });
        }
        const shipment = await Shipment_1.Shipment.create({ order_id, company, tracking_number, status: status || "created" });
        res.status(201).json({ success: true, data: shipment });
    }
    catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ success: false, error: "Tracking number already exists" });
        }
        next(err);
    }
}
async function updateShipmentStatus(req, res, next) {
    try {
        const { status } = req.body;
        const validStatuses = ["created", "picked_up", "in_transit", "out_for_delivery", "delivered", "returned"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: `status must be one of: ${validStatuses.join(", ")}` });
        }
        const shipment = await Shipment_1.Shipment.findByPk(req.params.id);
        if (!shipment)
            return res.status(404).json({ success: false, error: "Shipment not found" });
        const delivered_at = status === "delivered" ? new Date() : shipment.delivered_at;
        await shipment.update({ status, delivered_at });
        res.json({ success: true, data: shipment });
    }
    catch (err) {
        next(err);
    }
}
