"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.getProduct = getProduct;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const Category_1 = require("../models/Category");
const sequelize_1 = require("sequelize");
async function listProducts(req, res, next) {
    try {
        const { name, location, category_id, role } = req.query;
        const where = {};
        const userWhere = {};
        if (name)
            where.name = { [sequelize_1.Op.like]: `%${name}%` };
        if (category_id)
            where.category_id = category_id;
        if (location)
            userWhere.location = { [sequelize_1.Op.like]: `%${location}%` };
        const products = await Product_1.Product.findAll({
            where,
            include: [
                {
                    model: User_1.User,
                    as: "supplier",
                    where: Object.keys(userWhere).length > 0 ? userWhere : undefined
                },
                { model: Category_1.Category, as: "category" }
            ]
        });
        // Strategy: for Retailer → show wholesale_price as price; for Wholesaler → show existing prices
        const processedProducts = products.map(p => {
            const data = p.toJSON();
            if (role === "Retailer" && data.wholesale_price) {
                data.price = data.wholesale_price;
                data.is_wholesale = true;
            }
            else if (role === "Wholesaler") {
                // For wholesalers browsing supplier products, show wholesale_price prominently
                data.is_wholesale = !!data.wholesale_price;
            }
            return data;
        });
        res.json({ success: true, data: processedProducts });
    }
    catch (err) {
        next(err);
    }
}
async function getProduct(req, res, next) {
    try {
        const product = await Product_1.Product.findByPk(req.params.id, { include: [{ model: User_1.User, as: "supplier" }] });
        if (!product)
            return res.status(404).json({ success: false, error: "Product not found" });
        res.json({ success: true, data: product });
    }
    catch (err) {
        next(err);
    }
}
async function createProduct(req, res, next) {
    try {
        const { name, sku, price, wholesale_price, min_order_qty, supplier_id, quantity, status, category_id, description, image } = req.body;
        if (!name || !sku || price === undefined || !supplier_id) {
            return res.status(400).json({
                success: false,
                error: "Required fields: name, sku, price, supplier_id"
            });
        }
        const product = await Product_1.Product.create({
            name, sku,
            price: Number(price),
            wholesale_price: wholesale_price ? Number(wholesale_price) : null,
            min_order_qty: Number(min_order_qty) || 1,
            supplier_id: Number(supplier_id),
            quantity: Number(quantity) || 0,
            status: status || "active",
            category_id: category_id ? Number(category_id) : null,
            description: description || null,
            image: image || null
        });
        res.status(201).json({ success: true, data: product });
    }
    catch (err) {
        console.error("Product creation error:", err);
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ success: false, error: "SKU already exists" });
        }
        if (err.name === "SequelizeForeignKeyConstraintError") {
            return res.status(400).json({ success: false, error: "Invalid supplier_id or category_id" });
        }
        res.status(500).json({ success: false, error: err.message || "Failed to create product" });
    }
}
async function updateProduct(req, res, next) {
    try {
        const product = await Product_1.Product.findByPk(req.params.id);
        if (!product)
            return res.status(404).json({ success: false, error: "Product not found" });
        await product.update(req.body);
        res.json({ success: true, data: product });
    }
    catch (err) {
        next(err);
    }
}
async function deleteProduct(req, res, next) {
    try {
        const product = await Product_1.Product.findByPk(req.params.id);
        if (!product)
            return res.status(404).json({ success: false, error: "Product not found" });
        await product.destroy();
        res.json({ success: true, message: "Product deleted" });
    }
    catch (err) {
        next(err);
    }
}
