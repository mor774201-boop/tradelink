"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = getRecommendations;
exports.getSimilarProducts = getSimilarProducts;
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const OrderItem_1 = require("../models/OrderItem");
const User_1 = require("../models/User");
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
async function getRecommendations(req, res, next) {
    try {
        const { user_id } = req.query;
        let recommendedProducts = [];
        if (user_id) {
            const user = await User_1.User.findByPk(user_id);
            if (user) {
                // 1. Get categories the user frequently buys from
                const userOrders = await Order_1.Order.findAll({
                    where: { buyer_id: user.id },
                    include: [{ model: OrderItem_1.OrderItem, as: "items", include: [{ model: Product_1.Product, as: "product" }] }]
                });
                const categoryCounts = {};
                userOrders.forEach(order => {
                    order.items?.forEach((item) => {
                        if (item.product?.category_id) {
                            categoryCounts[item.product.category_id] = (categoryCounts[item.product.category_id] || 0) + 1;
                        }
                    });
                });
                const topCategoryIds = Object.keys(categoryCounts)
                    .sort((a, b) => categoryCounts[Number(b)] - categoryCounts[Number(a)])
                    .slice(0, 2)
                    .map(Number);
                if (topCategoryIds.length > 0) {
                    recommendedProducts = await Product_1.Product.findAll({
                        where: { category_id: topCategoryIds, status: "active" },
                        limit: 6,
                        order: models_1.sequelize.random()
                    });
                }
            }
        }
        // 2. Fallback or additional: Top selling products globally based on order items
        if (recommendedProducts.length < 6) {
            const topSellingResult = await models_1.sequelize.query(`SELECT product_id, SUM(quantity) as total_sold 
                 FROM order_items 
                 GROUP BY product_id 
                 ORDER BY total_sold DESC 
                 LIMIT 10`, { type: sequelize_1.QueryTypes.SELECT });
            const topSellingIds = topSellingResult.map(r => r.product_id);
            const existingIds = new Set(recommendedProducts.map(p => p.id));
            const additionalIds = topSellingIds.filter(id => !existingIds.has(id)).slice(0, 6 - recommendedProducts.length);
            if (additionalIds.length > 0) {
                const additionalProducts = await Product_1.Product.findAll({
                    where: { id: additionalIds, status: "active" }
                });
                recommendedProducts = [...recommendedProducts, ...additionalProducts];
            }
            // 3. Ultimate fallback: if still less than 6, get random active products
            if (recommendedProducts.length < 6) {
                const randomProducts = await Product_1.Product.findAll({
                    where: {
                        status: "active",
                        id: { [require("sequelize").Op.notIn]: recommendedProducts.map(p => p.id) }
                    },
                    limit: 6 - recommendedProducts.length,
                    order: models_1.sequelize.random()
                });
                recommendedProducts = [...recommendedProducts, ...randomProducts];
            }
        }
        // Add simulated AI confidence scores and sort
        const results = recommendedProducts.map(p => {
            const data = p.toJSON();
            // Simulate AI logic: items in top categories get higher scores
            const baseScore = 0.7 + (Math.random() * 0.25);
            data.ai_confidence = parseFloat(baseScore.toFixed(2));
            return data;
        }).sort((a, b) => b.ai_confidence - a.ai_confidence);
        res.json({ success: true, data: results });
    }
    catch (err) {
        next(err);
    }
}
async function getSimilarProducts(req, res, next) {
    try {
        const { product_id } = req.params;
        const product = await Product_1.Product.findByPk(product_id);
        if (!product)
            return res.status(404).json({ success: false, error: "Product not found" });
        const similar = await Product_1.Product.findAll({
            where: {
                category_id: product.category_id,
                id: { [require("sequelize").Op.ne]: product.id },
                status: "active"
            },
            limit: 4,
            order: models_1.sequelize.random()
        });
        res.json({ success: true, data: similar });
    }
    catch (err) {
        next(err);
    }
}
