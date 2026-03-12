"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getSupplierStats = getSupplierStats;
exports.getAdminStats = getAdminStats;
exports.getWholesalerStats = getWholesalerStats;
exports.getRetailerStats = getRetailerStats;
exports.getWholesalerReport = getWholesalerReport;
const User_1 = require("../models/User");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const Invoice_1 = require("../models/Invoice");
const Payment_1 = require("../models/Payment");
const Shipment_1 = require("../models/Shipment");
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
async function getDashboardStats(_req, res, next) {
    try {
        const [totalUsers, totalProducts, totalOrders, pendingOrders, confirmedOrders, shippedOrders, deliveredOrders, cancelledOrders, totalInvoices, unpaidInvoices, totalShipments, inTransitShipments,] = await Promise.all([
            User_1.User.count(),
            Product_1.Product.count(),
            Order_1.Order.count(),
            Order_1.Order.count({ where: { status: "pending" } }),
            Order_1.Order.count({ where: { status: "confirmed" } }),
            Order_1.Order.count({ where: { status: "shipped" } }),
            Order_1.Order.count({ where: { status: "delivered" } }),
            Order_1.Order.count({ where: { status: "cancelled" } }),
            Invoice_1.Invoice.count(),
            Invoice_1.Invoice.count({ where: { status: "unpaid" } }),
            Shipment_1.Shipment.count(),
            Shipment_1.Shipment.count({ where: { status: "in_transit" } }),
        ]);
        // Revenue from completed payments
        const revenueResult = await models_1.sequelize.query(`SELECT 
                COALESCE(SUM(amount), 0) as total,
                COALESCE(SUM(CASE WHEN created_at >= date('now', 'start of day') THEN amount ELSE 0 END), 0) as today,
                COALESCE(SUM(CASE WHEN created_at >= date('now', 'start of month') THEN amount ELSE 0 END), 0) as month
             FROM payments WHERE status = 'completed'`, { type: sequelize_1.QueryTypes.SELECT });
        const totalRevenue = parseFloat(revenueResult[0]?.total || "0");
        const todayRevenue = parseFloat(revenueResult[0]?.today || "0");
        const monthRevenue = parseFloat(revenueResult[0]?.month || "0");
        // Top 5 products by order item quantity
        const topProducts = await models_1.sequelize.query(`SELECT p.id, p.name, p.sku, p.price, COALESCE(SUM(oi.quantity), 0) as total_sold
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 5`, { type: sequelize_1.QueryTypes.SELECT });
        res.json({
            success: true,
            data: {
                users: { total: totalUsers },
                products: { total: totalProducts, top: topProducts },
                orders: {
                    total: totalOrders,
                    by_status: { pending: pendingOrders, confirmed: confirmedOrders, shipped: shippedOrders, delivered: deliveredOrders, cancelled: cancelledOrders }
                },
                invoices: { total: totalInvoices, unpaid: unpaidInvoices },
                shipments: { total: totalShipments, in_transit: inTransitShipments },
                revenue: { total: totalRevenue, today: todayRevenue, month: monthRevenue }
            }
        });
    }
    catch (err) {
        next(err);
    }
}
async function getSupplierStats(req, res, next) {
    try {
        const userId = req.params.id;
        const totalProducts = await Product_1.Product.count({ where: { supplier_id: userId } });
        const totalOrders = await Order_1.Order.count({ where: { seller_id: userId } });
        const pendingOrders = await Order_1.Order.count({ where: { seller_id: userId, status: "pending" } });
        const products = await Product_1.Product.findAll({ where: { supplier_id: userId } });
        const totalQuantity = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
        const revenueResult = await models_1.sequelize.query(`SELECT 
                COALESCE(SUM(p.amount), 0) as total,
                COALESCE(SUM(CASE WHEN p.created_at >= date('now', 'start of day') THEN p.amount ELSE 0 END), 0) as today,
                COALESCE(SUM(CASE WHEN p.created_at >= date('now', 'start of month') THEN p.amount ELSE 0 END), 0) as month
             FROM payments p 
             JOIN orders o ON p.order_id = o.id 
             WHERE o.seller_id = ? AND p.status = 'completed'`, { replacements: [userId], type: sequelize_1.QueryTypes.SELECT });
        const totalRevenue = parseFloat(revenueResult[0]?.total || "0");
        const todayRevenue = parseFloat(revenueResult[0]?.today || "0");
        const monthRevenue = parseFloat(revenueResult[0]?.month || "0");
        res.json({
            success: true,
            data: {
                products: { total_products: totalProducts, total_quantity: totalQuantity },
                orders: { total_orders: totalOrders, pending_orders: pendingOrders },
                revenue: { total: totalRevenue, today: todayRevenue, month: monthRevenue }
            }
        });
    }
    catch (err) {
        next(err);
    }
}
async function getAdminStats(_req, res, next) {
    try {
        const [totalUsers, totalProducts, totalOrders, totalPayments] = await Promise.all([
            User_1.User.count(),
            Product_1.Product.count(),
            Order_1.Order.count(),
            Payment_1.Payment.count()
        ]);
        // Users by role
        const usersByRole = await models_1.sequelize.query(`SELECT r.name as role, COUNT(u.id) as count FROM users u JOIN roles r ON u.role_id = r.id GROUP BY r.name`, { type: sequelize_1.QueryTypes.SELECT });
        // Revenue
        const revenueResult = await models_1.sequelize.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`, { type: sequelize_1.QueryTypes.SELECT });
        const totalRevenue = parseFloat(revenueResult[0]?.total || "0");
        // Orders by status
        const ordersByStatus = await models_1.sequelize.query(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`, { type: sequelize_1.QueryTypes.SELECT });
        res.json({
            success: true,
            data: {
                users: { total: totalUsers, by_role: usersByRole },
                products: { total: totalProducts },
                orders: { total: totalOrders, by_status: ordersByStatus },
                payments: { total: totalPayments },
                revenue: { total: totalRevenue }
            }
        });
    }
    catch (err) {
        next(err);
    }
}
async function getWholesalerStats(req, res, next) {
    try {
        const userId = req.params.id;
        const user = await User_1.User.findByPk(userId);
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" });
        const totalProducts = await Product_1.Product.count({ where: { supplier_id: userId } });
        const products = await Product_1.Product.findAll({ where: { supplier_id: userId } });
        const totalQuantity = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
        const totalOrders = await Order_1.Order.count({ where: { seller_id: userId } });
        const pendingOrders = await Order_1.Order.count({ where: { seller_id: userId, status: "pending" } });
        const revenueResult = await models_1.sequelize.query(`SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN orders o ON p.order_id = o.id WHERE o.seller_id = ? AND p.status = 'completed'`, { replacements: [userId], type: sequelize_1.QueryTypes.SELECT });
        const totalRevenue = parseFloat(revenueResult[0]?.total || "0");
        res.json({
            success: true,
            data: {
                products: { total: totalProducts, total_quantity: totalQuantity },
                orders: { total: totalOrders, pending: pendingOrders },
                revenue: { total: totalRevenue },
                balance: user.balance
            }
        });
    }
    catch (err) {
        next(err);
    }
}
async function getRetailerStats(req, res, next) {
    try {
        const userId = req.params.id;
        const user = await User_1.User.findByPk(userId);
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" });
        const totalOrders = await Order_1.Order.count({ where: { buyer_id: userId } });
        const pendingOrders = await Order_1.Order.count({ where: { buyer_id: userId, status: "pending" } });
        const spentResult = await models_1.sequelize.query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE buyer_id = ?`, { replacements: [userId], type: sequelize_1.QueryTypes.SELECT });
        const totalSpent = parseFloat(spentResult[0]?.total || "0");
        res.json({
            success: true,
            data: {
                orders: { total: totalOrders, pending: pendingOrders },
                spending: { total: totalSpent },
                balance: user.balance
            }
        });
    }
    catch (err) {
        next(err);
    }
}
async function getWholesalerReport(req, res, next) {
    try {
        const userId = req.params.id;
        const totalOrders = await Order_1.Order.count({ where: { seller_id: userId } });
        const revenueResult = await models_1.sequelize.query(`SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN orders o ON p.order_id = o.id WHERE o.seller_id = ? AND p.status = 'completed'`, { replacements: [userId], type: sequelize_1.QueryTypes.SELECT });
        const totalRevenue = parseFloat(revenueResult[0]?.total || "0");
        // Monthly data for the chart
        const monthlyData = await models_1.sequelize.query(`SELECT strftime('%m', o.created_at) as month, SUM(p.amount) as revenue
             FROM orders o
             JOIN payments p ON p.order_id = o.id
             WHERE o.seller_id = ? AND p.status = 'completed'
             GROUP BY month
             ORDER BY month ASC`, { replacements: [userId], type: sequelize_1.QueryTypes.SELECT });
        const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const labels = monthlyData.map(d => months[parseInt(d.month) - 1]);
        const data = monthlyData.map(d => parseFloat(d.revenue));
        res.json({
            success: true,
            data: {
                total_orders: totalOrders,
                total_revenue: totalRevenue,
                monthly_labels: labels.length ? labels : months.slice(0, 6),
                monthly_data: data.length ? data : [0, 0, 0, 0, 0, 0]
            }
        });
    }
    catch (err) {
        next(err);
    }
}
