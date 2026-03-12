"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Inventory extends sequelize_1.Model {
}
exports.Inventory = Inventory;
Inventory.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    warehouse_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize: index_1.sequelize,
    tableName: "inventory",
    timestamps: false
});
