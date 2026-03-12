import { Request, Response, NextFunction } from "express";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Product } from "../models/Product";
import { User } from "../models/User";

import { Op } from "sequelize";

const ORDER_INCLUDES = [
  { model: User, as: "buyer", attributes: ["id", "name", "email"] },
  { model: User, as: "seller", attributes: ["id", "name", "email"] },
  { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }
];

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const where: any = {};

    if (userRole !== "Admin") {
      where[Op.or] = [
        { buyer_id: userId },
        { seller_id: userId }
      ];
    }

    const orders = await Order.findAll({
      where,
      include: ORDER_INCLUDES,
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await Order.findByPk(req.params.id, { include: ORDER_INCLUDES });
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
}

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  const { buyer_id, seller_id, items } = req.body as {
    buyer_id: number;
    seller_id: number;
    items: { product_id: number; quantity: number; unit_price: number }[];
  };

  if (!buyer_id || !seller_id) {
    return res.status(400).json({ success: false, error: "buyer_id and seller_id are required" });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "At least one order item is required" });
  }

  try {
    const total_amount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const order = await Order.create({ buyer_id, seller_id, total_amount });
    await OrderItem.bulkCreate(items.map(item => ({ ...item, order_id: order.id })));

    // Notify Seller
    const { Notification } = require("../models/Notification");
    const buyer = await User.findByPk(buyer_id);
    await Notification.create({
      user_id: seller_id,
      title: "طلب جديد",
      message: `لديك طلب جديد رقم #${order.id} من ${buyer?.name || "عميل"}.`,
      type: "info"
    });

    const fullOrder = await Order.findByPk(order.id, { include: ORDER_INCLUDES });
    res.status(201).json({ success: true, data: fullOrder });
  } catch (err) { next(err); }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `status must be one of: ${validStatuses.join(", ")}` });
    }
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });
    await order.update({ status });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
}

export async function deleteOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });
    await OrderItem.destroy({ where: { order_id: order.id } });
    await order.destroy();
    res.json({ success: true, message: "Order deleted" });
  } catch (err) { next(err); }
}
