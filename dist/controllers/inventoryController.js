"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInventory = listInventory;
exports.getInventoryItem = getInventoryItem;
exports.createInventoryItem = createInventoryItem;
exports.updateInventory = updateInventory;
exports.adjustInventory = adjustInventory;
const Inventory_1 = require("../models/Inventory");
const Product_1 = require("../models/Product");
const Warehouse_1 = require("../models/Warehouse");
async function listInventory(_req, res, next) {
    try {
        const inventory = await Inventory_1.Inventory.findAll({
            include: [
                { model: Product_1.Product, as: "product" },
                { model: Warehouse_1.Warehouse, as: "warehouse" }
            ]
        });
        res.json({ success: true, data: inventory });
    }
    catch (err) {
        next(err);
    }
}
async function getInventoryItem(req, res, next) {
    try {
        const item = await Inventory_1.Inventory.findByPk(req.params.id, {
            include: [{ model: Product_1.Product, as: "product" }, { model: Warehouse_1.Warehouse, as: "warehouse" }]
        });
        if (!item)
            return res.status(404).json({ success: false, error: "Inventory item not found" });
        res.json({ success: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function createInventoryItem(req, res, next) {
    try {
        const { product_id, warehouse_id, quantity } = req.body;
        if (!product_id || !warehouse_id || quantity === undefined) {
            return res.status(400).json({ success: false, error: "Required: product_id, warehouse_id, quantity" });
        }
        const item = await Inventory_1.Inventory.create({ product_id, warehouse_id, quantity: Number(quantity) });
        res.status(201).json({ success: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function updateInventory(req, res, next) {
    try {
        const item = await Inventory_1.Inventory.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ success: false, error: "Inventory item not found" });
        const { quantity } = req.body;
        if (quantity === undefined) {
            return res.status(400).json({ success: false, error: "quantity is required" });
        }
        await item.update({ quantity: Number(quantity) });
        res.json({ success: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function adjustInventory(req, res, next) {
    try {
        const item = await Inventory_1.Inventory.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ success: false, error: "Inventory item not found" });
        const { delta } = req.body; // positive = add, negative = subtract
        if (delta === undefined)
            return res.status(400).json({ success: false, error: "delta is required" });
        const newQty = item.quantity + Number(delta);
        if (newQty < 0)
            return res.status(400).json({ success: false, error: "Insufficient inventory quantity" });
        await item.update({ quantity: newQty });
        res.json({ success: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
