"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWarehouses = listWarehouses;
exports.getWarehouse = getWarehouse;
exports.createWarehouse = createWarehouse;
exports.updateWarehouse = updateWarehouse;
exports.deleteWarehouse = deleteWarehouse;
const Warehouse_1 = require("../models/Warehouse");
const User_1 = require("../models/User");
async function listWarehouses(_req, res, next) {
    try {
        const warehouses = await Warehouse_1.Warehouse.findAll({ include: [{ model: User_1.User, as: "owner" }] });
        res.json({ success: true, data: warehouses });
    }
    catch (err) {
        next(err);
    }
}
async function getWarehouse(req, res, next) {
    try {
        const warehouse = await Warehouse_1.Warehouse.findByPk(req.params.id, { include: [{ model: User_1.User, as: "owner" }] });
        if (!warehouse)
            return res.status(404).json({ success: false, error: "Warehouse not found" });
        res.json({ success: true, data: warehouse });
    }
    catch (err) {
        next(err);
    }
}
async function createWarehouse(req, res, next) {
    try {
        const { owner_id, city, address, capacity } = req.body;
        if (!owner_id || !city || !address || capacity === undefined) {
            return res.status(400).json({ success: false, error: "Required: owner_id, city, address, capacity" });
        }
        const warehouse = await Warehouse_1.Warehouse.create({ owner_id, city, address, capacity: Number(capacity) });
        res.status(201).json({ success: true, data: warehouse });
    }
    catch (err) {
        next(err);
    }
}
async function updateWarehouse(req, res, next) {
    try {
        const warehouse = await Warehouse_1.Warehouse.findByPk(req.params.id);
        if (!warehouse)
            return res.status(404).json({ success: false, error: "Warehouse not found" });
        await warehouse.update(req.body);
        res.json({ success: true, data: warehouse });
    }
    catch (err) {
        next(err);
    }
}
async function deleteWarehouse(req, res, next) {
    try {
        const warehouse = await Warehouse_1.Warehouse.findByPk(req.params.id);
        if (!warehouse)
            return res.status(404).json({ success: false, error: "Warehouse not found" });
        await warehouse.destroy();
        res.json({ success: true, message: "Warehouse deleted" });
    }
    catch (err) {
        next(err);
    }
}
