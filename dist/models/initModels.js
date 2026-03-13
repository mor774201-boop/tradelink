"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModels = initModels;
const Role_1 = require("./Role");
const User_1 = require("./User");
const Product_1 = require("./Product");
const Category_1 = require("./Category");
const Warehouse_1 = require("./Warehouse");
const Inventory_1 = require("./Inventory");
const Order_1 = require("./Order");
const OrderItem_1 = require("./OrderItem");
const Invoice_1 = require("./Invoice");
const Payment_1 = require("./Payment");
const Shipment_1 = require("./Shipment");
const Notification_1 = require("./Notification");
const Withdrawal_1 = require("./Withdrawal");
const WalletTransaction_1 = require("./WalletTransaction");
const Cart_1 = require("./Cart");
const CartItem_1 = require("./CartItem");
function initModels() {
    // users & roles
    User_1.User.belongsTo(Role_1.Role, { foreignKey: "role_id", as: "role" });
    Role_1.Role.hasMany(User_1.User, { foreignKey: "role_id", as: "users" });
    // products & suppliers
    Product_1.Product.belongsTo(User_1.User, { foreignKey: "supplier_id", as: "supplier" });
    User_1.User.hasMany(Product_1.Product, { foreignKey: "supplier_id", as: "products" });
    // products & categories
    Product_1.Product.belongsTo(Category_1.Category, { foreignKey: "category_id", as: "category" });
    Category_1.Category.hasMany(Product_1.Product, { foreignKey: "category_id", as: "products" });
    // warehouses
    Warehouse_1.Warehouse.belongsTo(User_1.User, { foreignKey: "owner_id", as: "owner" });
    User_1.User.hasMany(Warehouse_1.Warehouse, { foreignKey: "owner_id", as: "warehouses" });
    // inventory
    Inventory_1.Inventory.belongsTo(Product_1.Product, { foreignKey: "product_id", as: "product" });
    Product_1.Product.hasMany(Inventory_1.Inventory, { foreignKey: "product_id", as: "inventory" });
    Inventory_1.Inventory.belongsTo(Warehouse_1.Warehouse, { foreignKey: "warehouse_id", as: "warehouse" });
    Warehouse_1.Warehouse.hasMany(Inventory_1.Inventory, { foreignKey: "warehouse_id", as: "inventory" });
    // orders
    Order_1.Order.belongsTo(User_1.User, { foreignKey: "buyer_id", as: "buyer" });
    Order_1.Order.belongsTo(User_1.User, { foreignKey: "seller_id", as: "seller" });
    User_1.User.hasMany(Order_1.Order, { foreignKey: "buyer_id", as: "buyerOrders" });
    User_1.User.hasMany(Order_1.Order, { foreignKey: "seller_id", as: "sellerOrders" });
    // order items
    OrderItem_1.OrderItem.belongsTo(Order_1.Order, { foreignKey: "order_id", as: "order" });
    Order_1.Order.hasMany(OrderItem_1.OrderItem, { foreignKey: "order_id", as: "items" });
    OrderItem_1.OrderItem.belongsTo(Product_1.Product, { foreignKey: "product_id", as: "product" });
    Product_1.Product.hasMany(OrderItem_1.OrderItem, { foreignKey: "product_id", as: "orderItems" });
    // invoices
    Invoice_1.Invoice.belongsTo(Order_1.Order, { foreignKey: "order_id", as: "order" });
    Order_1.Order.hasOne(Invoice_1.Invoice, { foreignKey: "order_id", as: "invoice" });
    // payments
    Payment_1.Payment.belongsTo(Order_1.Order, { foreignKey: "order_id", as: "order" });
    Order_1.Order.hasMany(Payment_1.Payment, { foreignKey: "order_id", as: "payments" });
    // shipments
    Shipment_1.Shipment.belongsTo(Order_1.Order, { foreignKey: "order_id", as: "order" });
    Order_1.Order.hasMany(Shipment_1.Shipment, { foreignKey: "order_id", as: "shipments" });
    // notifications
    Notification_1.Notification.belongsTo(User_1.User, { foreignKey: "user_id", as: "user" });
    User_1.User.hasMany(Notification_1.Notification, { foreignKey: "user_id", as: "notifications" });
    // withdrawals
    Withdrawal_1.Withdrawal.belongsTo(User_1.User, { foreignKey: "user_id", as: "user" });
    User_1.User.hasMany(Withdrawal_1.Withdrawal, { foreignKey: "user_id", as: "withdrawals" });
    // wallet transactions
    WalletTransaction_1.WalletTransaction.belongsTo(User_1.User, { foreignKey: "user_id", as: "user" });
    User_1.User.hasMany(WalletTransaction_1.WalletTransaction, { foreignKey: "user_id", as: "walletTransactions" });
    // carts
    Cart_1.Cart.belongsTo(User_1.User, { foreignKey: "user_id", as: "user" });
    User_1.User.hasOne(Cart_1.Cart, { foreignKey: "user_id", as: "cart" });
    // cart items
    CartItem_1.CartItem.belongsTo(Cart_1.Cart, { foreignKey: "cart_id", as: "cart" });
    Cart_1.Cart.hasMany(CartItem_1.CartItem, { foreignKey: "cart_id", as: "items" });
    CartItem_1.CartItem.belongsTo(Product_1.Product, { foreignKey: "product_id", as: "product" });
    Product_1.Product.hasMany(CartItem_1.CartItem, { foreignKey: "product_id", as: "cartItems" });
}
