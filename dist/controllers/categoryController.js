"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.getCategory = getCategory;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const Category_1 = require("../models/Category");
async function listCategories(_req, res, next) {
    try {
        const categories = await Category_1.Category.findAll();
        res.json({ success: true, data: categories });
    }
    catch (err) {
        next(err);
    }
}
async function getCategory(req, res, next) {
    try {
        const category = await Category_1.Category.findByPk(req.params.id);
        if (!category)
            return res.status(404).json({ success: false, error: "Category not found" });
        res.json({ success: true, data: category });
    }
    catch (err) {
        next(err);
    }
}
async function createCategory(req, res, next) {
    try {
        const { name, description } = req.body;
        if (!name)
            return res.status(400).json({ success: false, error: "name is required" });
        const category = await Category_1.Category.create({ name, description });
        res.status(201).json({ success: true, data: category });
    }
    catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ success: false, error: "Category name already exists" });
        }
        next(err);
    }
}
async function updateCategory(req, res, next) {
    try {
        const category = await Category_1.Category.findByPk(req.params.id);
        if (!category)
            return res.status(404).json({ success: false, error: "Category not found" });
        await category.update(req.body);
        res.json({ success: true, data: category });
    }
    catch (err) {
        next(err);
    }
}
async function deleteCategory(req, res, next) {
    try {
        const category = await Category_1.Category.findByPk(req.params.id);
        if (!category)
            return res.status(404).json({ success: false, error: "Category not found" });
        await category.destroy();
        res.json({ success: true, message: "Category deleted" });
    }
    catch (err) {
        next(err);
    }
}
