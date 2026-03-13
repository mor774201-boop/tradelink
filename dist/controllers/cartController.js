"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCart = getCart;
exports.addToCart = addToCart;
exports.updateCartItem = updateCartItem;
exports.removeFromCart = removeFromCart;
exports.checkout = checkout;
const Cart_1 = require("../models/Cart");
const CartItem_1 = require("../models/CartItem");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const OrderItem_1 = require("../models/OrderItem");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
const models_1 = require("../models");
async function getCart(req, res, next) {
    try {
        const { user_id } = req.params;
        let cart = await Cart_1.Cart.findOne({
            where: { user_id },
            include: [{ model: CartItem_1.CartItem, as: "items", include: [{ model: Product_1.Product, as: "product" }] }]
        });
        if (!cart) {
            cart = await Cart_1.Cart.create({ user_id });
            return res.json({ success: true, data: { ...cart.toJSON(), items: [] } });
        }
        res.json({ success: true, data: cart });
    }
    catch (err) {
        next(err);
    }
}
async function addToCart(req, res, next) {
    try {
        const { user_id, product_id, quantity } = req.body;
        let cart = await Cart_1.Cart.findOne({ where: { user_id } });
        if (!cart)
            cart = await Cart_1.Cart.create({ user_id });
        let item = await CartItem_1.CartItem.findOne({ where: { cart_id: cart.id, product_id } });
        if (item) {
            await item.update({ quantity: item.quantity + (quantity || 1) });
        }
        else {
            item = await CartItem_1.CartItem.create({ cart_id: cart.id, product_id, quantity: quantity || 1 });
        }
        res.json({ success: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function updateCartItem(req, res, next) {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const item = await CartItem_1.CartItem.findByPk(id);
        if (!item)
            return res.status(404).json({ success: false, error: "Item not found" });
        if (quantity <= 0) {
            await item.destroy();
            return res.json({ success: true, message: "Item removed" });
        }
        await item.update({ quantity });
        res.json({ success: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function removeFromCart(req, res, next) {
    try {
        const { id } = req.params;
        const item = await CartItem_1.CartItem.findByPk(id);
        if (!item)
            return res.status(404).json({ success: false, error: "Item not found" });
        await item.destroy();
        res.json({ success: true, message: "Item removed" });
    }
    catch (err) {
        next(err);
    }
}
async function checkout(req, res, next) {
    const t = await models_1.sequelize.transaction();
    try {
        const { user_id } = req.body;
        const cart = await Cart_1.Cart.findOne({
            where: { user_id },
            include: [{ model: CartItem_1.CartItem, as: "items", include: [{ model: Product_1.Product, as: "product" }] }]
        });
        if (!cart || !cart.items || cart.items.length === 0) {
            await t.rollback();
            return res.status(400).json({ success: false, error: "Cart is empty" });
        }
        // Group items by supplier
        const itemsBySupplier = {};
        for (const item of cart.items) {
            const p = item.product;
            if (!p)
                continue;
            if (!itemsBySupplier[p.supplier_id])
                itemsBySupplier[p.supplier_id] = [];
            itemsBySupplier[p.supplier_id].push(item);
        }
        const orders = [];
        const buyer = await User_1.User.findByPk(user_id);
        for (const supplier_id in itemsBySupplier) {
            const supplierItems = itemsBySupplier[supplier_id];
            const total_amount = supplierItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
            const order = await Order_1.Order.create({
                buyer_id: user_id,
                seller_id: Number(supplier_id),
                total_amount,
                status: "pending"
            }, { transaction: t });
            await OrderItem_1.OrderItem.bulkCreate(supplierItems.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.product.price
            })), { transaction: t });
            // Notify Seller
            await Notification_1.Notification.create({
                user_id: Number(supplier_id),
                title: "طلب جديد من سلة المشتري",
                message: `لديك طلب جديد رقم #${order.id} من ${buyer?.name || "عميل"}.`,
                type: "info"
            }, { transaction: t });
            orders.push(order);
        }
        // Clear cart
        await CartItem_1.CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });
        await t.commit();
        res.json({ success: true, data: orders });
    }
    catch (err) {
        await t.rollback();
        next(err);
    }
}
