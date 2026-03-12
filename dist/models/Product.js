"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Product extends sequelize_1.Model {
}
exports.Product = Product;
Product.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    supplier_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "categories",
            key: "id"
        }
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    sku: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    wholesale_price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    min_order_qty: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "active"
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    ai_description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: index_1.sequelize,
    tableName: "products",
    timestamps: false
});
