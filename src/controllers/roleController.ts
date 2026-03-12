import { Request, Response, NextFunction } from "express";
import { Role } from "../models/Role";

export async function listRoles(_req: Request, res: Response, next: NextFunction) {
    try {
        const roles = await Role.findAll();
        res.json({ success: true, data: roles });
    } catch (err) { next(err); }
}

export async function createRole(req: Request, res: Response, next: NextFunction) {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: "name is required" });
        const role = await Role.create({ name });
        res.status(201).json({ success: true, data: role });
    } catch (err) { next(err); }
}
