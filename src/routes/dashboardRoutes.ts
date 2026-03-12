import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { Role } from "../models/Role";
import { Payment } from "../models/Payment";
import { Category } from "../models/Category";
import { Op } from "sequelize";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/user-data - Get authenticated user's data
router.get("/user-data", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: "role" }]
        });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch user data" });
    }
});

// GET /api/stats/supplier - Get supplier-specific stats
router.get("/stats/supplier", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const totalProducts = await Product.count({ where: { supplier_id: userId } });
        const totalOrders = await Order.count({ where: { seller_id: userId } });
        const pendingOrders = await Order.count({ where: { seller_id: userId, status: "pending" } });

        const products = await Product.findAll({ where: { supplier_id: userId } });
        const totalQuantity = products.reduce((acc, p) => acc + (p.quantity || 0), 0);

        // Revenue stats for this supplier
        const orders = await Order.findAll({ where: { seller_id: userId } });
        const orderIds = orders.map(o => o.id);

        const payments = orderIds.length > 0
            ? await Payment.findAll({ where: { order_id: { [Op.in]: orderIds }, status: "completed" } })
            : [];

        const totalRevenue = payments.reduce((s, p) => s + parseFloat(String(p.amount)), 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRevenue = payments.filter(p => {
            const d = (p as any).createdAt ? new Date((p as any).createdAt) : null;
            return d && d >= today;
        }).reduce((s, p) => s + parseFloat(String(p.amount)), 0);

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthRevenue = payments.filter(p => {
            const d = (p as any).createdAt ? new Date((p as any).createdAt) : null;
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
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats", details: error });
    }
});

// GET /api/stats/wholesaler/:id - Kept for compatibility but should use auth
router.get("/stats/wholesaler/:id", requireAuth, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // Security check: if not admin, can only see own stats
        if ((req as any).userRole !== "Admin" && (req as any).userId !== id) {
            return res.status(403).json({ error: "Access denied" });
        }

        const user = await User.findByPk(id);
        const products = await Product.findAll({ where: { supplier_id: id } });
        const orders = await Order.findAll({ where: { seller_id: id } });

        const orderIds = orders.map(o => o.id);
        const payments = orderIds.length > 0
            ? await Payment.findAll({ where: { order_id: { [Op.in]: orderIds }, status: "completed" } })
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
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch wholesaler stats", details: error });
    }
});

// GET /api/stats/retailer/:id
router.get("/stats/retailer/:id", requireAuth, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if ((req as any).userRole !== "Admin" && (req as any).userId !== id) {
            return res.status(403).json({ error: "Access denied" });
        }

        const user = await User.findByPk(id);
        const orders = await Order.findAll({ where: { buyer_id: id } });

        const orderIds = orders.map(o => o.id);
        const payments = orderIds.length > 0
            ? await Payment.findAll({ where: { order_id: { [Op.in]: orderIds }, status: "completed" } })
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
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch retailer stats", details: error });
    }
});

// GET /api/supplier/products — supplier's own products
router.get("/supplier/products", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const products = await Product.findAll({
            where: { supplier_id: userId },
            include: [
                { model: Category, as: "category" }
            ]
        });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products", details: error });
    }
});

// POST /api/supplier/products - Create product for authenticated supplier
router.post("/supplier/products", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { name, sku, price, quantity, category_id, description, image } = req.body;

        if (!name || !sku || price === undefined) {
            return res.status(400).json({ success: false, error: "Required: name, sku, price" });
        }

        const product = await Product.create({
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
    } catch (error: any) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ success: false, error: "SKU already exists" });
        }
        res.status(400).json({ success: false, error: "Failed to create product", details: error.message });
    }
});

// GET /api/admin/users — Admin only
router.get("/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({ include: [{ model: Role, as: "role" }] });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users", details: error });
    }
});

// GET /api/admin/payments — Admin only
router.get("/admin/payments", requireAdmin, async (req: Request, res: Response) => {
    try {
        const payments = await Payment.findAll({ include: [{ model: Order, as: "order" }] });
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch payments", details: error });
    }
});

// POST /api/logout
router.post("/logout", (req, res) => {
    res.json({ success: true });
});

export default router;

