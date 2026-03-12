import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { Invoice } from "../models/Invoice";
import { Payment } from "../models/Payment";
import { Shipment } from "../models/Shipment";
import { sequelize } from "../models";
import { QueryTypes, Op } from "sequelize";

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
    try {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            pendingOrders,
            confirmedOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalInvoices,
            unpaidInvoices,
            totalShipments,
            inTransitShipments,
        ] = await Promise.all([
            User.count(),
            Product.count(),
            Order.count(),
            Order.count({ where: { status: "pending" } }),
            Order.count({ where: { status: "confirmed" } }),
            Order.count({ where: { status: "shipped" } }),
            Order.count({ where: { status: "delivered" } }),
            Order.count({ where: { status: "cancelled" } }),
            Invoice.count(),
            Invoice.count({ where: { status: "unpaid" } }),
            Shipment.count(),
            Shipment.count({ where: { status: "in_transit" } }),
        ]);

        // Revenue from completed payments
        const revenueResult = await sequelize.query(
            `SELECT 
                COALESCE(SUM(amount), 0) as total,
                COALESCE(SUM(CASE WHEN created_at >= date('now', 'start of day') THEN amount ELSE 0 END), 0) as today,
                COALESCE(SUM(CASE WHEN created_at >= date('now', 'start of month') THEN amount ELSE 0 END), 0) as month
             FROM payments WHERE status = 'completed'`,
            { type: QueryTypes.SELECT }
        ) as any[];

        const totalRevenue = parseFloat(revenueResult[0]?.total || "0");
        const todayRevenue = parseFloat(revenueResult[0]?.today || "0");
        const monthRevenue = parseFloat(revenueResult[0]?.month || "0");

        // Top 5 products by order item quantity
        const topProducts = await sequelize.query(
            `SELECT p.id, p.name, p.sku, p.price, COALESCE(SUM(oi.quantity), 0) as total_sold
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 5`,
            { type: QueryTypes.SELECT }
        );

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
    } catch (err) { next(err); }
}

export async function getSupplierStats(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.id;
        const totalProducts = await Product.count({ where: { supplier_id: userId } });
        const totalOrders = await Order.count({ where: { seller_id: userId } });
        const pendingOrders = await Order.count({ where: { seller_id: userId, status: "pending" } });
        const products = await Product.findAll({ where: { supplier_id: userId } });
        const totalQuantity = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
        const revenueResult = await sequelize.query(
            `SELECT 
                COALESCE(SUM(p.amount), 0) as total,
                COALESCE(SUM(CASE WHEN p.created_at >= date('now', 'start of day') THEN p.amount ELSE 0 END), 0) as today,
                COALESCE(SUM(CASE WHEN p.created_at >= date('now', 'start of month') THEN p.amount ELSE 0 END), 0) as month
             FROM payments p 
             JOIN orders o ON p.order_id = o.id 
             WHERE o.seller_id = ? AND p.status = 'completed'`,
            { replacements: [userId], type: QueryTypes.SELECT }
        ) as any[];

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
    } catch (err) { next(err); }
}

export async function getAdminStats(_req: Request, res: Response, next: NextFunction) {
    try {
        const [totalUsers, totalProducts, totalOrders, totalPayments] = await Promise.all([
            User.count(),
            Product.count(),
            Order.count(),
            Payment.count()
        ]);

        // Users by role
        const usersByRole = await sequelize.query(
            `SELECT r.name as role, COUNT(u.id) as count FROM users u JOIN roles r ON u.role_id = r.id GROUP BY r.name`,
            { type: QueryTypes.SELECT }
        ) as any[];

        // Revenue
        const revenueResult = await sequelize.query(
            `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`,
            { type: QueryTypes.SELECT }
        ) as any[];
        const totalRevenue = parseFloat(revenueResult[0]?.total || "0");

        // Orders by status
        const ordersByStatus = await sequelize.query(
            `SELECT status, COUNT(*) as count FROM orders GROUP BY status`,
            { type: QueryTypes.SELECT }
        ) as any[];

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
    } catch (err) { next(err); }
}

export async function getWholesalerStats(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        const totalProducts = await Product.count({ where: { supplier_id: userId } });
        const products = await Product.findAll({ where: { supplier_id: userId } });
        const totalQuantity = products.reduce((acc, p) => acc + (p.quantity || 0), 0);

        const totalOrders = await Order.count({ where: { seller_id: userId } });
        const pendingOrders = await Order.count({ where: { seller_id: userId, status: "pending" } });

        const revenueResult = await sequelize.query(
            `SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN orders o ON p.order_id = o.id WHERE o.seller_id = ? AND p.status = 'completed'`,
            { replacements: [userId], type: QueryTypes.SELECT }
        ) as any[];
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
    } catch (err) { next(err); }
}

export async function getRetailerStats(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        const totalOrders = await Order.count({ where: { buyer_id: userId } });
        const pendingOrders = await Order.count({ where: { buyer_id: userId, status: "pending" } });

        const spentResult = await sequelize.query(
            `SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE buyer_id = ?`,
            { replacements: [userId], type: QueryTypes.SELECT }
        ) as any[];
        const totalSpent = parseFloat(spentResult[0]?.total || "0");

        res.json({
            success: true,
            data: {
                orders: { total: totalOrders, pending: pendingOrders },
                spending: { total: totalSpent },
                balance: user.balance
            }
        });
    } catch (err) { next(err); }
}

export async function getWholesalerReport(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.id;
        const totalOrders = await Order.count({ where: { seller_id: userId } });
        const revenueResult = await sequelize.query(
            `SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p JOIN orders o ON p.order_id = o.id WHERE o.seller_id = ? AND p.status = 'completed'`,
            { replacements: [userId], type: QueryTypes.SELECT }
        ) as any[];
        const totalRevenue = parseFloat(revenueResult[0]?.total || "0");

        // Monthly data for the chart
        const monthlyData = await sequelize.query(
            `SELECT strftime('%m', o.created_at) as month, SUM(p.amount) as revenue
             FROM orders o
             JOIN payments p ON p.order_id = o.id
             WHERE o.seller_id = ? AND p.status = 'completed'
             GROUP BY month
             ORDER BY month ASC`,
            { replacements: [userId], type: QueryTypes.SELECT }
        ) as any[];

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
    } catch (err) { next(err); }
}
