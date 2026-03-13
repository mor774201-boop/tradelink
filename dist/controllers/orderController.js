"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrders = listOrders;
exports.getOrder = getOrder;
exports.createOrder = createOrder;
exports.updateOrderStatus = updateOrderStatus;
exports.deleteOrder = deleteOrder;
const Order_1 = require("../models/Order");
const OrderItem_1 = require("../models/OrderItem");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
const ORDER_INCLUDES = [
    { model: User_1.User, as: "buyer", attributes: ["id", "name", "email"] },
    { model: User_1.User, as: "seller", attributes: ["id", "name", "email"] },
    { model: OrderItem_1.OrderItem, as: "items", include: [{ model: Product_1.Product, as: "product" }] }
];
async function listOrders(req, res, next) {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const where = {};
        if (userRole !== "Admin") {
            where[sequelize_1.Op.or] = [
                { buyer_id: userId },
                { seller_id: userId }
            ];
        }
        const orders = await Order_1.Order.findAll({
            where,
            include: ORDER_INCLUDES,
            order: [['created_at', 'DESC']]
        });
        res.json({ success: true, data: orders });
    }
    catch (err) {
        next(err);
    }
}
async function getOrder(req, res, next) {
    try {
        const order = await Order_1.Order.findByPk(req.params.id, { include: ORDER_INCLUDES });
        if (!order)
            return res.status(404).json({ success: false, error: "Order not found" });
        res.json({ success: true, data: order });
    }
    catch (err) {
        next(err);
    }
}
async function createOrder(req, res, next) {
    const { buyer_id, seller_id, items } = req.body;
    if (!buyer_id || !seller_id) {
        return res.status(400).json({ success: false, error: "buyer_id and seller_id are required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: "At least one order item is required" });
    }
    try {
        const total_amount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
        const order = await Order_1.Order.create({ buyer_id, seller_id, total_amount });
        await OrderItem_1.OrderItem.bulkCreate(items.map(item => ({ ...item, order_id: order.id })));
        // Notify Seller
        const { Notification } = require("../models/Notification");
        const buyer = await User_1.User.findByPk(buyer_id);
        await Notification.create({
            user_id: seller_id,
            title: "طلب جديد",
            message: `لديك طلب جديد رقم #${order.id} من ${buyer?.name || "عميل"}.`,
            type: "info"
        });
        const fullOrder = await Order_1.Order.findByPk(order.id, { include: ORDER_INCLUDES });
        res.status(201).json({ success: true, data: fullOrder });
    }
    catch (err) {
        next(err);
    }
}
async function updateOrderStatus(req, res, next) {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: `status must be one of: ${validStatuses.join(", ")}` });
        }
        const order = await Order_1.Order.findByPk(req.params.id);
        if (!order)
            return res.status(404).json({ success: false, error: "Order not found" });
        await order.update({ status });
        res.json({ success: true, data: order });
    }
    catch (err) {
        next(err);
    }
}
async function deleteOrder(req, res, next) {
    try {
        const order = await Order_1.Order.findByPk(req.params.id);
        if (!order)
            return res.status(404).json({ success: false, error: "Order not found" });
        await OrderItem_1.OrderItem.destroy({ where: { order_id: order.id } });
        await order.destroy();
        res.json({ success: true, message: "Order deleted" });
    }
    catch (err) {
        next(err);
    }
}
