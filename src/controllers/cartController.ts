import { Request, Response, NextFunction } from "express";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { sequelize } from "../models";

export async function getCart(req: Request, res: Response, next: NextFunction) {
    try {
        const { user_id } = req.params;
        let cart = await Cart.findOne({
            where: { user_id },
            include: [{ model: CartItem, as: "items", include: [{ model: Product, as: "product" }] }]
        });

        if (!cart) {
            cart = await Cart.create({ user_id });
            return res.json({ success: true, data: { ...cart.toJSON(), items: [] } });
        }

        res.json({ success: true, data: cart });
    } catch (err) { next(err); }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
    try {
        const { user_id, product_id, quantity } = req.body;
        let cart = await Cart.findOne({ where: { user_id } });
        if (!cart) cart = await Cart.create({ user_id });

        let item = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });
        if (item) {
            await item.update({ quantity: item.quantity + (quantity || 1) });
        } else {
            item = await CartItem.create({ cart_id: cart.id, product_id, quantity: quantity || 1 });
        }

        res.json({ success: true, data: item });
    } catch (err) { next(err); }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const item = await CartItem.findByPk(id);
        if (!item) return res.status(404).json({ success: false, error: "Item not found" });

        if (quantity <= 0) {
            await item.destroy();
            return res.json({ success: true, message: "Item removed" });
        }

        await item.update({ quantity });
        res.json({ success: true, data: item });
    } catch (err) { next(err); }
}

export async function removeFromCart(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const item = await CartItem.findByPk(id);
        if (!item) return res.status(404).json({ success: false, error: "Item not found" });
        await item.destroy();
        res.json({ success: true, message: "Item removed" });
    } catch (err) { next(err); }
}

export async function checkout(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    try {
        const { user_id } = req.body;
        const cart = await Cart.findOne({
            where: { user_id },
            include: [{ model: CartItem, as: "items", include: [{ model: Product, as: "product" }] }]
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            await t.rollback();
            return res.status(400).json({ success: false, error: "Cart is empty" });
        }

        // Group items by supplier
        const itemsBySupplier: { [key: number]: any[] } = {};
        for (const item of cart.items) {
            const p = item.product;
            if (!p) continue;
            if (!itemsBySupplier[p.supplier_id]) itemsBySupplier[p.supplier_id] = [];
            itemsBySupplier[p.supplier_id].push(item);
        }

        const orders = [];
        const buyer = await User.findByPk(user_id);

        for (const supplier_id in itemsBySupplier) {
            const supplierItems = itemsBySupplier[supplier_id];
            const total_amount = supplierItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

            const order = await Order.create({
                buyer_id: user_id,
                seller_id: Number(supplier_id),
                total_amount,
                status: "pending"
            }, { transaction: t });

            await OrderItem.bulkCreate(supplierItems.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.product.price
            })), { transaction: t });

            // Notify Seller
            await Notification.create({
                user_id: Number(supplier_id),
                title: "طلب جديد من سلة المشتري",
                message: `لديك طلب جديد رقم #${order.id} من ${buyer?.name || "عميل"}.`,
                type: "info"
            }, { transaction: t });

            orders.push(order);
        }

        // Clear cart
        await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

        await t.commit();
        res.json({ success: true, data: orders });
    } catch (err) {
        await t.rollback();
        next(err);
    }
}
