import { Request, Response, NextFunction } from "express";
import { Inventory } from "../models/Inventory";
import { Product } from "../models/Product";
import { Warehouse } from "../models/Warehouse";

export async function listInventory(_req: Request, res: Response, next: NextFunction) {
    try {
        const inventory = await Inventory.findAll({
            include: [
                { model: Product, as: "product" },
                { model: Warehouse, as: "warehouse" }
            ]
        });
        res.json({ success: true, data: inventory });
    } catch (err) { next(err); }
}

export async function getInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
        const item = await Inventory.findByPk(req.params.id, {
            include: [{ model: Product, as: "product" }, { model: Warehouse, as: "warehouse" }]
        });
        if (!item) return res.status(404).json({ success: false, error: "Inventory item not found" });
        res.json({ success: true, data: item });
    } catch (err) { next(err); }
}

export async function createInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
        const { product_id, warehouse_id, quantity } = req.body;
        if (!product_id || !warehouse_id || quantity === undefined) {
            return res.status(400).json({ success: false, error: "Required: product_id, warehouse_id, quantity" });
        }
        const item = await Inventory.create({ product_id, warehouse_id, quantity: Number(quantity) });
        res.status(201).json({ success: true, data: item });
    } catch (err) { next(err); }
}

export async function updateInventory(req: Request, res: Response, next: NextFunction) {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) return res.status(404).json({ success: false, error: "Inventory item not found" });
        const { quantity } = req.body;
        if (quantity === undefined) {
            return res.status(400).json({ success: false, error: "quantity is required" });
        }
        await item.update({ quantity: Number(quantity) });
        res.json({ success: true, data: item });
    } catch (err) { next(err); }
}

export async function adjustInventory(req: Request, res: Response, next: NextFunction) {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) return res.status(404).json({ success: false, error: "Inventory item not found" });
        const { delta } = req.body; // positive = add, negative = subtract
        if (delta === undefined) return res.status(400).json({ success: false, error: "delta is required" });
        const newQty = item.quantity + Number(delta);
        if (newQty < 0) return res.status(400).json({ success: false, error: "Insufficient inventory quantity" });
        await item.update({ quantity: newQty });
        res.json({ success: true, data: item });
    } catch (err) { next(err); }
}
