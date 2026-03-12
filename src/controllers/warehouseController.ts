import { Request, Response, NextFunction } from "express";
import { Warehouse } from "../models/Warehouse";
import { User } from "../models/User";

export async function listWarehouses(_req: Request, res: Response, next: NextFunction) {
    try {
        const warehouses = await Warehouse.findAll({ include: [{ model: User, as: "owner" }] });
        res.json({ success: true, data: warehouses });
    } catch (err) { next(err); }
}

export async function getWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id, { include: [{ model: User, as: "owner" }] });
        if (!warehouse) return res.status(404).json({ success: false, error: "Warehouse not found" });
        res.json({ success: true, data: warehouse });
    } catch (err) { next(err); }
}

export async function createWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
        const { owner_id, city, address, capacity } = req.body;
        if (!owner_id || !city || !address || capacity === undefined) {
            return res.status(400).json({ success: false, error: "Required: owner_id, city, address, capacity" });
        }
        const warehouse = await Warehouse.create({ owner_id, city, address, capacity: Number(capacity) });
        res.status(201).json({ success: true, data: warehouse });
    } catch (err) { next(err); }
}

export async function updateWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id);
        if (!warehouse) return res.status(404).json({ success: false, error: "Warehouse not found" });
        await warehouse.update(req.body);
        res.json({ success: true, data: warehouse });
    } catch (err) { next(err); }
}

export async function deleteWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id);
        if (!warehouse) return res.status(404).json({ success: false, error: "Warehouse not found" });
        await warehouse.destroy();
        res.json({ success: true, message: "Warehouse deleted" });
    } catch (err) { next(err); }
}
