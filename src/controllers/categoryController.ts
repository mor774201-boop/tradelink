import { Request, Response, NextFunction } from "express";
import { Category } from "../models/Category";

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
    try {
        const categories = await Category.findAll();
        res.json({ success: true, data: categories });
    } catch (err) { next(err); }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ success: false, error: "Category not found" });
        res.json({ success: true, data: category });
    } catch (err) { next(err); }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ success: false, error: "name is required" });
        const category = await Category.create({ name, description });
        res.status(201).json({ success: true, data: category });
    } catch (err: any) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ success: false, error: "Category name already exists" });
        }
        next(err);
    }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ success: false, error: "Category not found" });
        await category.update(req.body);
        res.json({ success: true, data: category });
    } catch (err) { next(err); }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ success: false, error: "Category not found" });
        await category.destroy();
        res.json({ success: true, message: "Category deleted" });
    } catch (err) { next(err); }
}
