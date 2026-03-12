"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const userRoutes_1 = require("./userRoutes");
const auth_1 = require("../middleware/auth");
const productRoutes_1 = require("./productRoutes");
const orderRoutes_1 = require("./orderRoutes");
const warehouseRoutes_1 = require("./warehouseRoutes");
const inventoryRoutes_1 = require("./inventoryRoutes");
const invoiceRoutes_1 = require("./invoiceRoutes");
const paymentRoutes_1 = require("./paymentRoutes");
const shipmentRoutes_1 = require("./shipmentRoutes");
const roleRoutes_1 = require("./roleRoutes");
const statsRoutes_1 = require("./statsRoutes");
const notificationRoutes_1 = require("./notificationRoutes");
const categoryRoutes_1 = require("./categoryRoutes");
const subscriptionRoutes_1 = __importDefault(require("./subscriptionRoutes"));
const withdrawalRoutes_1 = __importDefault(require("./withdrawalRoutes"));
const walletRoutes_1 = __importDefault(require("./walletRoutes"));
const cartRoutes_1 = require("./cartRoutes");
const recommendationRoutes_1 = require("./recommendationRoutes");
const dashboardRoutes_1 = __importDefault(require("./dashboardRoutes"));
const aiRoutes_1 = require("./aiRoutes");
const userController = __importStar(require("../controllers/userController"));
const paymentController = __importStar(require("../controllers/paymentController"));
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.use("/users", userRoutes_1.userRouter);
exports.apiRouter.use("/products", productRoutes_1.productRouter);
exports.apiRouter.use("/orders", orderRoutes_1.orderRouter);
exports.apiRouter.use("/warehouses", warehouseRoutes_1.warehouseRouter);
exports.apiRouter.use("/inventory", inventoryRoutes_1.inventoryRouter);
exports.apiRouter.use("/invoices", invoiceRoutes_1.invoiceRouter);
exports.apiRouter.use("/payments", paymentRoutes_1.paymentRouter);
exports.apiRouter.use("/shipments", shipmentRoutes_1.shipmentRouter);
exports.apiRouter.use("/roles", roleRoutes_1.roleRouter);
exports.apiRouter.use("/stats", statsRoutes_1.statsRouter);
exports.apiRouter.use("/notifications", notificationRoutes_1.notificationRouter);
exports.apiRouter.use("/categories", categoryRoutes_1.categoryRouter);
exports.apiRouter.use("/subscription", subscriptionRoutes_1.default);
exports.apiRouter.use("/withdrawals", withdrawalRoutes_1.default);
exports.apiRouter.use("/wallet", walletRoutes_1.default);
exports.apiRouter.use("/cart", cartRoutes_1.cartRouter);
exports.apiRouter.use("/recommendations", recommendationRoutes_1.recommendationRouter);
exports.apiRouter.use("/", dashboardRoutes_1.default);
exports.apiRouter.use("/ai", aiRoutes_1.aiRouter);
// Dashboard & Unique Utility Routes
exports.apiRouter.get("/user-data", auth_1.requireAuth, userController.getCurrentUserData);
exports.apiRouter.post("/logout", auth_1.requireAuth, userController.logout);
// Specialized views
exports.apiRouter.get("/admin/users", auth_1.requireAdmin, userController.listUsers);
exports.apiRouter.get("/admin/payments", auth_1.requireAdmin, paymentController.listPayments);
