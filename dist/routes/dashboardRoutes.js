"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const Role_1 = require("../models/Role");
const Payment_1 = require("../models/Payment");
const Category_1 = require("../models/Category");
const sequelize_1 = require("sequelize");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/user-data - Get authenticated user's data
router.get("/user-data", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User_1.User.findByPk(userId, {
            include: [{ model: Role_1.Role, as: "role" }]
        });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch user data" });
    }
});
// GET /api/stats/supplier - Get supplier-specific stats
router.get("/stats/supplier", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const totalProducts = await Product_1.Product.count({ where: { supplier_id: userId } });
        const totalOrders = await Order_1.Order.count({ where: { seller_id: userId } });
        const pendingOrders = await Order_1.Order.count({ where: { seller_id: userId, status: "pending" } });
        const products = await Product_1.Product.findAll({ where: { supplier_id: userId } });
        const totalQuantity = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
        // Revenue stats for this supplier
        const orders = await Order_1.Order.findAll({ where: { seller_id: userId } });
        const orderIds = orders.map(o => o.id);
        const payments = orderIds.length > 0
            ? await Payment_1.Payment.findAll({ where: { order_id: { [sequelize_1.Op.in]: orderIds }, status: "completed" } })
            : [];
        const totalRevenue = payments.reduce((s, p) => s + parseFloat(String(p.amount)), 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRevenue = payments.filter(p => {
            const d = p.createdAt ? new Date(p.createdAt) : null;
            return d && d >= today;
        }).reduce((s, p) => s + parseFloat(String(p.amount)), 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthRevenue = payments.filter(p => {
            const d = p.createdAt ? new Date(p.createdAt) : null;
            return d && d >= monthStart;
        }).reduce((s, p) => s + parseFloat(String(p.amount)), 0);
        res.json({
            success: true,
            data: {
                products: {
                    total_products: totalProducts,
                    total_quantity: totalQuantity
                },
                orders: {
                    total_orders: totalOrders,
                    pending_orders: pendingOrders
                },
                revenue: {
                    total: totalRevenue,
                    today: todayRevenue,
                    month: monthRevenue
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch stats", details: error });
    }
});
// GET /api/stats/wholesaler/:id - Kept for compatibility but should use auth
router.get("/stats/wholesaler/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // Security check: if not admin, can only see own stats
        if (req.userRole !== "Admin" && req.userId !== id) {
            return res.status(403).json({ error: "Access denied" });
        }
        const user = await User_1.User.findByPk(id);
        const products = await Product_1.Product.findAll({ where: { supplier_id: id } });
        const orders = await Order_1.Order.findAll({ where: { seller_id: id } });
        const orderIds = orders.map(o => o.id);
        const payments = orderIds.length > 0
            ? await Payment_1.Payment.findAll({ where: { order_id: { [sequelize_1.Op.in]: orderIds }, status: "completed" } })
            : [];
        const revenue = payments.reduce((s, p) => s + parseFloat(String(p.amount)), 0);
        res.json({
            success: true,
            data: {
                products: { total: products.length },
                orders: { total: orders.length, pending: orders.filter(o => o.status === "pending").length },
                revenue: { total: revenue },
                balance: user?.balance || 0
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch wholesaler stats", details: error });
    }
});
// GET /api/stats/retailer/:id
router.get("/stats/retailer/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (req.userRole !== "Admin" && req.userId !== id) {
            return res.status(403).json({ error: "Access denied" });
        }
        const user = await User_1.User.findByPk(id);
        const orders = await Order_1.Order.findAll({ where: { buyer_id: id } });
        const orderIds = orders.map(o => o.id);
        const payments = orderIds.length > 0
            ? await Payment_1.Payment.findAll({ where: { order_id: { [sequelize_1.Op.in]: orderIds }, status: "completed" } })
            : [];
        const spending = payments.reduce((s, p) => s + parseFloat(String(p.amount)), 0);
        res.json({
            success: true,
            data: {
                orders: {
                    total: orders.length,
                    pending: orders.filter(o => o.status === "pending").length
                },
                spending: { total: spending },
                balance: user?.balance || 0
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch retailer stats", details: error });
    }
});
// GET /api/supplier/products — supplier's own products
router.get("/supplier/products", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const products = await Product_1.Product.findAll({
            where: { supplier_id: userId },
            include: [
                { model: Category_1.Category, as: "category" }
            ]
        });
        res.json({ success: true, data: products });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch products", details: error });
    }
});
// POST /api/supplier/products - Create product for authenticated supplier
router.post("/supplier/products", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const { name, sku, price, quantity, category_id, description, image } = req.body;
        if (!name || !sku || price === undefined) {
            return res.status(400).json({ success: false, error: "Required: name, sku, price" });
        }
        const product = await Product_1.Product.create({
            name, sku,
            price: Number(price),
            quantity: Number(quantity) || 0,
            category_id: category_id ? Number(category_id) : null,
            supplier_id: userId,
            description: description || null,
            image: image || null,
            status: "active",
            min_order_qty: 1
        });
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ success: false, error: "SKU already exists" });
        }
        res.status(400).json({ success: false, error: "Failed to create product", details: error.message });
    }
});
// GET /api/admin/users — Admin only
router.get("/admin/users", auth_1.requireAdmin, async (req, res) => {
    try {
        const users = await User_1.User.findAll({ include: [{ model: Role_1.Role, as: "role" }] });
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users", details: error });
    }
});
// GET /api/admin/payments — Admin only
router.get("/admin/payments", auth_1.requireAdmin, async (req, res) => {
    try {
        const payments = await Payment_1.Payment.findAll({ include: [{ model: Order_1.Order, as: "order" }] });
        res.json({ success: true, data: payments });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch payments", details: error });
    }
});
// POST /api/logout
router.post("/logout", (req, res) => {
    res.json({ success: true });
});
exports.default = router;
